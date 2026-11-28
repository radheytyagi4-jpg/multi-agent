
from backend.hulk.chat import hulk
from backend.wanda.chat import wanda
from backend.strange.chat import strange


if __name__ == "__main__":

    # STEP 1: Test Wanda
    print("\n========== WANDA ==========\n")

    frontend_task = """
    Create a responsive expense tracker dashboard.
    Generate complete working React + TypeScript + Tailwind CSS code.
    Include all required files.
    """

    frontend_code = wanda(frontend_task)

    print("Frontend output type:", type(frontend_code))
    print("Frontend output length:", len(frontend_code) if isinstance(frontend_code, str) else "Not a string")
    print(frontend_code)

    # STEP 2: Test Dr. Strange
    print("\n========== DR. STRANGE ==========\n")

    backend_task = """
    Build a complete user authentication API using FastAPI.

    Requirements:
    - User registration
    - Login
    - JWT authentication
    - Password hashing
    - PostgreSQL database
    - Input validation

    Generate actual working source code, not just a plan.
    """

    backend_code = strange(backend_task)

    print("Backend output type:", type(backend_code))
    print("Backend output length:", len(backend_code) if isinstance(backend_code, str) else "Not a string")
    print(backend_code)

    # STEP 3: Check outputs before Hulk
    if not frontend_code or not backend_code:
        print("\nERROR: One or both agents returned empty output.")
    else:
        # STEP 4: Hulk QA
        print("\n========== HULK QA ==========\n")

        report = hulk(frontend_code, backend_code)

        print(report)
