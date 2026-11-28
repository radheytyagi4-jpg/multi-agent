
import os
import uuid
from typing import Annotated, Any, Literal, TypedDict

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from langgraph.graph import StateGraph, START, END
from langgraph.types import Send, interrupt, Command
from langgraph.checkpoint.memory import MemorySaver

# Existing Avengers
from backend.ironman.chat import architect_agent
from backend.wanda.chat import wanda
from backend.strange.chat import strange
from backend.hulk.chat import hulk


load_dotenv()


# ============================================================
# 1. CONFIGURATION
# ============================================================

CAPTAIN_MODEL = os.getenv(
    "CAPTAIN_MODEL",
    "qwen/qwen3-coder"
)

MAX_QA_RETRIES = 3

captain_llm = ChatOpenAI(
    model=CAPTAIN_MODEL,
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv(
        "OPENROUTER_BASE_URL",
        "https://openrouter.ai/api/v1"
    ),
    temperature=0.2,
    max_tokens=4096,
)


# ============================================================
# 2. STRUCTURED OUTPUT MODELS
# ============================================================

class ProjectBrief(BaseModel):
    project_name: str
    project_goal: str
    required_features: list[str]
    preferred_technologies: dict[str, str]
    constraints: list[str]
    unresolved_questions: list[str]


class AgentTask(BaseModel):
    agent: Literal["wanda", "strange", "thor"]
    task: str
    depends_on: list[str] = Field(default_factory=list)


class TaskPlan(BaseModel):
    explanation: str
    tasks: list[AgentTask]


class QADecision(BaseModel):
    passed: bool
    summary: str
    issues: list[str] = Field(default_factory=list)
    fixes: list[AgentTask] = Field(default_factory=list)


# ============================================================
# 3. SHARED PROJECT STATE
# ============================================================

def merge_dicts(
    old: dict | None,
    new: dict | None
) -> dict:
    return {**(old or {}), **(new or {})}


class ProjectState(TypedDict, total=False):

    project_id: str

    user_request: str
    project_brief: dict

    architecture: str
    architecture_feedback: str
    architecture_approved: bool

    task_plan: list[dict]
    selected_agents: list[str]

    agent_outputs: Annotated[dict, merge_dicts]
    qa_report: str
    qa_decision: dict

    retry_count: int
    current_phase: str
    project_status: str

    final_report: str
    errors: Annotated[list[str], lambda a, b: a + b]


# Input schema for parallel agent workers
class AgentTaskState(TypedDict, total=False):
    agent: str
    task: str
    agent_outputs: dict


# ============================================================
# 4. CAPTAIN - REQUIREMENT ANALYSIS
# ============================================================

def requirement_analysis(state: ProjectState):

    prompt = """
    You are Captain America, project manager of Avengers.

    Analyze the user's project request.

    Extract:
    - Project name
    - Main goal
    - Required features
    - Preferred technologies
    - Constraints
    - Unresolved questions

    Do not silently change the user's requested technologies.
    Separate required features from assumptions.
    """

    analyzer = captain_llm.with_structured_output(ProjectBrief)

    brief = analyzer.invoke([
        SystemMessage(content=prompt),
        HumanMessage(content=state["user_request"])
    ])

    return {
        "project_brief": brief.model_dump(),
        "current_phase": "requirement_analysis",
        "project_status": "planning"
    }


# ============================================================
# 5. IRON MAN - ARCHITECTURE
# ============================================================

def architecture_node(state: ProjectState):

    brief = state["project_brief"]

    architecture_request = f"""
    USER REQUIREMENTS:
    {brief}

    PREVIOUS ARCHITECTURE FEEDBACK:
    {state.get("architecture_feedback", "None")}

    Create a complete system architecture.

    Include:

    1. Project overview
    2. Technology stack
    3. Frontend architecture
    4. Backend architecture
    5. Database design
    6. API contracts
    7. Authentication and security
    8. Project folder structure
    9. Agent-specific development requirements
    10. Integration requirements
    11. Testing strategy
    12. Deployment strategy

    Make sure frontend and backend contracts are clearly defined.

    Do not ignore the user's preferred technologies.
    Explain any proposed deviation.
    """

    architecture = architect_agent(architecture_request)

    return {
        "architecture": str(architecture),
        "architecture_feedback": "",
        "current_phase": "architecture_review",
        "project_status": "waiting_for_architecture_approval"
    }


# ============================================================
# 6. HUMAN ARCHITECTURE APPROVAL
# ============================================================

def architecture_review(state: ProjectState):

    decision = interrupt({
        "type": "architecture_approval",
        "project_id": state["project_id"],
        "architecture": state["architecture"],
        "message": "Review and approve the architecture before development."
    })

    return {
        "architecture_approved": (
            decision.get("decision") == "approve"
        ),
        "architecture_feedback": decision.get("feedback", ""),
        "current_phase": "architecture_review"
    }


def route_after_review(state: ProjectState):

    if state.get("architecture_approved"):
        return "task_planning"

    if state.get("architecture_feedback"):
        return "architecture"

    return "rejected"


def rejected_node(state: ProjectState):

    return {
        "project_status": "architecture_rejected",
        "final_report": (
            "Architecture was rejected. "
            "No development tasks were started."
        )
    }


# ============================================================
# 7. CAPTAIN - DYNAMIC TASK PLANNING
# ============================================================

def task_planning(state: ProjectState):

    planner = captain_llm.with_structured_output(TaskPlan)

    prompt = f"""
    You are Captain America, project manager.

    APPROVED ARCHITECTURE:
    {state["architecture"]}

    PROJECT REQUIREMENTS:
    {state["project_brief"]}

    Choose only the agents needed for this project.

    Available agents:

    WANDA:
    Frontend, React, UI, UX, components and frontend integration.

    STRANGE:
    Backend, APIs, databases, authentication and server logic.

    THOR:
    Docker, CI/CD, GitHub workflows and deployment.
    Thor is not implemented yet. Do not assign Thor executable
    work in this version.

    RULES:

    1. Select agents dynamically.
    2. Do not select agents unnecessarily.
    3. Break work into clear, independent tasks.
    4. Include all necessary architecture details in each task.
    5. Specify dependencies between tasks.
    6. Frontend and backend can run in parallel when independent.
    7. Follow the approved API contracts.
    8. Do not start QA as a development task.
    9. Do not assign work to an unimplemented agent.
    """

    plan = planner.invoke([
        SystemMessage(content=prompt),
        HumanMessage(content="Create the development task plan.")
    ])

    return {
        "task_plan": [
            task.model_dump()
            for task in plan.tasks
        ],
        "selected_agents": list({
            task.agent for task in plan.tasks
        }),
        "current_phase": "development",
        "project_status": "in_progress"
    }


# ============================================================
# 8. PARALLEL AGENT EXECUTION
# ============================================================

def dispatch_agents(state: ProjectState):

    tasks = state.get("task_plan", [])

    if not tasks:
        return "integration"

    # Independent tasks are dispatched in the same graph step.
    # Tasks with dependencies are checked before dispatch.
    completed_agents = set(state.get("agent_outputs", {}).keys())

    ready_tasks = [
        task for task in tasks
        if task["agent"] not in completed_agents
        and all(
            dependency in completed_agents
            for dependency in task.get("depends_on", [])
        )
    ]

    if not ready_tasks:
        return "integration"

    return [
        Send(
            "execute_agent",
            {
                "agent": task["agent"],
                "task": (
                    "APPROVED ARCHITECTURE:\n"
                    + state["architecture"]
                    + "\n\nPROJECT REQUIREMENTS:\n"
                    + str(state["project_brief"])
                    + "\n\nYOUR ASSIGNED TASK:\n"
                    + task["task"]
                )
            }
        )
        for task in ready_tasks
    ]


def execute_agent(state: AgentTaskState):

    agent_name = state["agent"]
    task = state["task"]

    try:

        print(f"Captain assigned task to {agent_name}")

        if agent_name == "wanda":
            result = wanda(task)

        elif agent_name == "strange":
            result = strange(task)

        elif agent_name == "thor":
            raise NotImplementedError(
                "Thor has not been implemented yet."
            )

        else:
            raise ValueError(f"Unknown agent: {agent_name}")

        return {
            "agent_outputs": {
                agent_name: {
                    "status": "completed",
                    "output": str(result)
                }
            }
        }

    except Exception as error:

        return {
            "agent_outputs": {
                agent_name: {
                    "status": "failed",
                    "output": str(error)
                }
            },
            "errors": [
                f"{agent_name} failed: {str(error)}"
            ]
        }


# ============================================================
# 9. INTEGRATION
# ============================================================

def integration_node(state: ProjectState):

    outputs = state.get("agent_outputs", {})

    failed_agents = [
        name for name, result in outputs.items()
        if result.get("status") != "completed"
    ]

    if failed_agents:
        return {
            "project_status": "development_failed",
            "current_phase": "integration",
            "final_report": (
                "Development failed for: "
                + ", ".join(failed_agents)
            )
        }

    return {
        "current_phase": "integration",
        "project_status": "ready_for_qa"
    }


def route_after_integration(state: ProjectState):

    if state.get("project_status") == "development_failed":
        return "final_report"

    outputs = state.get("agent_outputs", {})

    # QA is relevant when this project generated code.
    if any(
        name in outputs
        for name in ("wanda", "strange")
    ):
        return "qa"

    return "final_report"


# ============================================================
# 10. HULK - QUALITY ASSURANCE
# ============================================================

def qa_node(state: ProjectState):

    outputs = state.get("agent_outputs", {})

    frontend = outputs.get("wanda", {}).get("output", "")
    backend = outputs.get("strange", {}).get("output", "")

    report = hulk(
        frontend_code=frontend,
        backend_code=backend
    )

    return {
        "qa_report": str(report),
        "current_phase": "qa"
    }


# ============================================================
# 11. CAPTAIN - QA DECISION
# ============================================================

def qa_decision_node(state: ProjectState):

    evaluator = captain_llm.with_structured_output(QADecision)

    prompt = f"""
    You are Captain America reviewing Hulk's QA report.

    QA REPORT:
    {state["qa_report"]}

    EXISTING AGENTS:
    Wanda: Frontend developer.
    Dr. Strange: Backend developer.

    Decide:

    - Whether the build passes QA.
    - Which issues need fixing.
    - Which developer should fix each issue.
    - Provide specific actionable fix instructions.

    Never claim tests passed if Hulk did not provide evidence.

    Do not assign more than the necessary fixes.
    """

    decision = evaluator.invoke([
        SystemMessage(content=prompt),
        HumanMessage(content="Evaluate the QA report.")
    ])

    return {
        "qa_decision": decision.model_dump(),
        "current_phase": "qa_review"
    }


def route_after_qa(state: ProjectState):

    decision = state.get("qa_decision", {})

    if decision.get("passed"):
        return "final_report"

    if state.get("retry_count", 0) >= MAX_QA_RETRIES:
        return "final_report"

    if not decision.get("fixes"):
        return "final_report"

    return "fix_planning"


# ============================================================
# 12. CAPTAIN - BUG FIX ASSIGNMENT
# ============================================================

def fix_planning(state: ProjectState):

    fixes = state["qa_decision"]["fixes"]

    return {
        "task_plan": [
            {
                "agent": fix["agent"],
                "task": (
                    "FIX THE FOLLOWING QA ISSUES:\n"
                    + fix["task"]
                    + "\n\nFollow the approved architecture."
                    + "\nDo not introduce unrelated changes."
                ),
                "depends_on": []
            }
            for fix in fixes
            if fix["agent"] in ("wanda", "strange")
        ],
        "agent_outputs": {},
        "retry_count": state.get("retry_count", 0) + 1,
        "current_phase": "bug_fixing",
        "project_status": "fixing_bugs"
    }


# ============================================================
# 13. FINAL REPORT
# ============================================================

def final_report_node(state: ProjectState):

    decision = state.get("qa_decision", {})

    passed = decision.get("passed", False)

    status = (
        "completed"
        if passed
        else state.get("project_status", "incomplete")
    )

    report = {
        "project_id": state["project_id"],
        "project_name": state.get(
            "project_brief", {}
        ).get("project_name", "Unnamed project"),

        "status": status,
        "architecture_approved": state.get(
            "architecture_approved", False
        ),

        "agents_used": state.get("selected_agents", []),

        "qa_passed": passed,
        "qa_summary": decision.get("summary", "QA not completed"),
        "qa_issues": decision.get("issues", []),

        "retry_count": state.get("retry_count", 0),
        "errors": state.get("errors", [])
    }

    return {
        "final_report": report,
        "project_status": status,
        "current_phase": "completed"
    }


# ============================================================
# 14. LANGGRAPH WORKFLOW
# ============================================================

def build_graph():

    builder = StateGraph(ProjectState)

    builder.add_node(
        "requirement_analysis",
        requirement_analysis
    )

    builder.add_node(
        "architecture",
        architecture_node
    )

    builder.add_node(
        "architecture_review",
        architecture_review
    )

    builder.add_node(
        "rejected",
        rejected_node
    )

    builder.add_node(
        "task_planning",
        task_planning
    )

    builder.add_node(
        "execute_agent",
        execute_agent
    )

    builder.add_node(
        "integration",
        integration_node
    )

    builder.add_node(
        "qa",
        qa_node
    )

    builder.add_node(
        "qa_decision",
        qa_decision_node
    )

    builder.add_node(
        "fix_planning",
        fix_planning
    )

    builder.add_node(
        "final_report",
        final_report_node
    )

    builder.add_edge(
        START,
        "requirement_analysis"
    )

    builder.add_edge(
        "requirement_analysis",
        "architecture"
    )

    builder.add_edge(
        "architecture",
        "architecture_review"
    )

    builder.add_conditional_edges(
        "architecture_review",
        route_after_review,
        {
            "task_planning": "task_planning",
            "architecture": "architecture",
            "rejected": "rejected"
        }
    )

    builder.add_edge(
        "rejected",
        END
    )

    builder.add_conditional_edges(
        "task_planning",
        dispatch_agents,
        ["execute_agent", "integration"]
    )

    builder.add_edge(
        "execute_agent",
        "integration"
    )

    builder.add_conditional_edges(
        "integration",
        route_after_integration,
        {
            "qa": "qa",
            "final_report": "final_report"
        }
    )

    builder.add_edge(
        "qa",
        "qa_decision"
    )

    builder.add_conditional_edges(
        "qa_decision",
        route_after_qa,
        {
            "final_report": "final_report",
            "fix_planning": "fix_planning"
        }
    )

    builder.add_conditional_edges(
        "fix_planning",
        dispatch_agents,
        ["execute_agent", "integration"]
    )

    builder.add_edge(
        "final_report",
        END
    )

    # MemorySaver is suitable for local development.
    # Replace with PostgreSQL checkpointer for production.
    checkpointer = MemorySaver()

    return builder.compile(
        checkpointer=checkpointer
    )


avengers_graph = build_graph()


# ============================================================
# 15. FASTAPI
# ============================================================

app = FastAPI(
    title="Avengers AI Development Team",
    version="2.0.0"
)


class StartProjectRequest(BaseModel):
    project_idea: str = Field(min_length=5)


class ApprovalRequest(BaseModel):
    decision: Literal["approve", "revise", "reject"]
    feedback: str = ""


@app.get("/")
def home():

    return {
        "message": "Avengers backend is running",
        "leader": "Captain America",
        "orchestration": "LangGraph",
        "agents": [
            "Captain America",
            "Iron Man",
            "Wanda",
            "Dr. Strange",
            "Hulk",
            "Thor"
        ]
    }


@app.post("/api/captain/start")
def start_project(request: StartProjectRequest):

    project_id = str(uuid.uuid4())

    config = {
        "configurable": {
            "thread_id": project_id
        }
    }

    initial_state = {
        "project_id": project_id,
        "user_request": request.project_idea,
        "retry_count": 0,
        "agent_outputs": {},
        "errors": [],
        "project_status": "started"
    }

    try:

        result = avengers_graph.invoke(
            initial_state,
            config=config
        )

        return {
            "project_id": project_id,
            "result": result
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.post("/api/captain/{project_id}/approval")
def approve_architecture(
    project_id: str,
    request: ApprovalRequest
):

    config = {
        "configurable": {
            "thread_id": project_id
        }
    }

    try:

        if request.decision == "approve":
            resume_value = {
                "decision": "approve",
                "feedback": ""
            }

        elif request.decision == "revise":
            resume_value = {
                "decision": "revise",
                "feedback": request.feedback
            }

        else:
            resume_value = {
                "decision": "reject",
                "feedback": request.feedback
            }

        result = avengers_graph.invoke(
            Command(resume=resume_value),
            config=config
        )

        return {
            "project_id": project_id,
            "result": result
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.get("/api/captain/{project_id}/status")
def project_status(project_id: str):

    config = {
        "configurable": {
            "thread_id": project_id
        }
    }

    try:

        snapshot = avengers_graph.get_state(config)

        return {
            "project_id": project_id,
            "values": snapshot.values,
            "next": snapshot.next,
            "tasks": snapshot.values.get("task_plan", []),
            "phase": snapshot.values.get("current_phase"),
            "status": snapshot.values.get("project_status")
        }

    except Exception as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )
