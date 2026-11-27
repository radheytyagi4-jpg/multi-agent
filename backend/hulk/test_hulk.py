
from backend.hulk.chat import hulk

frontend_code = """
function App() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:4000/api/users")
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    return <div>{users.map(user => <p>{user.name}</p>)}</div>;
}
"""

backend_code = """
@app.get("/api/users")
def get_users():
    return {"users": []}
"""

report = hulk(frontend_code, backend_code)

print(report)
