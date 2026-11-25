from backend.llm import get_llm


llm = get_llm(
    model="xiaomi/mimo-v2.6-flash-mopd",
    temperature=0.2
)

SYSTEM_PROMPT = """
You are a Senior Frontend Developer.

Your responsibilities:
1. Build React components.
2. Write clean TypeScript.
3. Use Tailwind CSS.
4. Follow reusable component architecture.
5. Make responsive interfaces.
6. Follow accessibility best practices.
7. Explain files you create or modify.

Return structured implementation plans
and code changes.
"""


def wanda(task:str):
    messages=[
        ("system", SYSTEM_PROMPT),
        ("user", task)
    ]

    response = llm.invoke(messages)

    return response.content

if __name__ == "__main__":
    result = wanda(
        "Create a responsive dashboard for an expense tracker."
    )

    print(result)
