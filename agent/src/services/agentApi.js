const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API request failed (${response.status})`)
  }
  if (response.status === 204) return null
  return response.json()
}

// Expected backend contract:
// GET  /api/agents/{agentId}/tasks -> { tasks: [...] } or [...]
// POST /api/agents/{agentId}/tasks body: { instruction: "..." } -> task object
export async function getAgentTasks(agentId) {
  const data = await request(`/api/agents/${agentId}/tasks`)
  return Array.isArray(data) ? data : (data?.tasks || [])
}

export function sendAgentInstruction(agentId, instruction) {
  return request(`/api/agents/${agentId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ instruction }),
  })
}
