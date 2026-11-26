import { useEffect, useState } from 'react'
import { getAgentTasks, sendAgentInstruction } from '../services/agentApi'
import './AgentWorkspace.css'

export default function AgentWorkspace({ agent }) {
  const [instruction, setInstruction] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAgentTasks(agent.id)
      .then(data => { if (active) setTasks(data) })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [agent.id])

  const submit = async event => {
    event.preventDefault()
    if (!instruction.trim()) return
    setSending(true)
    setError('')
    try {
      const task = await sendAgentInstruction(agent.id, instruction.trim())
      setTasks(current => [task, ...current])
      setInstruction('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return <section className="agent-workspace">
    <div className="agent-detail-heading">
      <div className={`agent-symbol large ${agent.tone}`}>{agent.icon}</div>
      <div><div className="eyebrow">AGENT WORKSPACE</div><h1>{agent.name}</h1><p>{agent.role}</p></div>
    </div>
    <section className="brief-panel instruction-panel">
      <div className="section-title"><div><span className="section-kicker">NEW INSTRUCTION</span><h2>Send a task</h2><p>Give this agent one instruction at a time.</p></div></div>
      <form className="brief-form" onSubmit={submit}>
        <textarea value={instruction} onChange={event => setInstruction(event.target.value)} placeholder={`Tell ${agent.name} what to do...`} rows="3" />
        <div className="brief-actions"><span>Sent to this agent's backend.</span><button type="submit" disabled={!instruction.trim() || sending}>{sending ? 'Sending...' : 'Send instruction ↗'}</button></div>
      </form>
    </section>
    <div className="section-heading"><div><span className="section-kicker">TASK HISTORY</span><h2>Instructions & work</h2></div><span className="history-count">{tasks.length} tasks</span></div>
    {error && <div className="agent-error">{error}</div>}
    {loading ? <div className="empty-state"><strong>Loading tasks...</strong></div> : tasks.length ? <div className="task-list">{tasks.map((task, index) => <article className="task-card" key={task.id || index}><div className="task-top"><strong>Instruction</strong><span className="status-pill">{task.status || 'Received'}</span></div><p className="task-instruction">{task.instruction || task.input || task.message}</p><div className="task-output"><span>AGENT UPDATE</span><p>{task.output || task.result || task.response || 'No update returned yet.'}</p></div><time>{task.created_at ? new Date(task.created_at).toLocaleString() : ''}</time></article>)}</div> : <div className="empty-state"><span>✧</span><strong>No tasks yet</strong><p>Tasks returned by the backend will appear here.</p></div>}
  </section>
}
