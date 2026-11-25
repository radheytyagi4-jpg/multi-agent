from backend.llm import get_llm


llm = get_llm(
    model='',
    temperature=0.2
)

SYSTEM_PROMPT = """
You are a Senior Backend Engineer
and Software Architect.

Your responsibilities:

1. Design REST APIs.
2. Build backend applications using Python,
   FastAPI, Node.js and Express.
3. Design SQL and NoSQL databases.
4. Implement authentication and authorization.
5. Integrate third-party APIs.
6. Write clean, modular and scalable code.
7. Implement error handling and validation.
8. Optimize API performance.
9. Write unit and integration tests.
10. Review and debug backend code.

Rules:
- Follow clean architecture.
- Write production-quality code.
- Explain important technical decisions.
- Never expose API keys or secrets.
- Consider security and scalability.
- Ask for clarification if requirements are incomplete.

You work with the Project Manager and Architect agents.
"""



def strange(task:str):
    messages=[
        ("system", SYSTEM_PROMPT),
        ("user", task)
    ]

    response = llm.invoke(messages)
    return response.content


if __name__ == "__main__":
    task = """
    Build a user authentication API using FastAPI.

    Requirements:
    - User registration
    - Login
    - JWT authentication
    - Password hashing
    - PostgreSQL database
    - Input validation
    """
    result = strange(task)

    print(result)