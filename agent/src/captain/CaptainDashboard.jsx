import { useMemo, useState } from 'react'
import './CaptainDashboard.css'

const initialAgents = [
  { id: 'architect', name: 'Iron Man', role: 'System Architect', detail: 'Designs systems and technical plans', icon: '⌘', tone: 'orange' },
  { id: 'frontend', name: 'Wanda', role: 'Frontend Developer', detail: 'Builds the interface and experience', icon: '✦', tone: 'pink' },
  { id: 'backend', name: 'Dr. Strange', role: 'Backend Developer', detail: 'Builds APIs and backend services', icon: '◈', tone: 'violet' },
  { id: 'tester', name: 'Hulk', role: 'QA Engineer · Tester', detail: 'Tests features and reports bugs', icon: '⬡', tone: 'green' },
  { id: 'devops', name: 'Thor', role: 'DevOps Engineer', detail: 'Handles deployment and infrastructure', icon: '⚡', tone: 'blue' },
]

const initialActivity = [
  { time: '09:42', title: 'Workspace ready', detail: 'All five agents are in the team.', type: 'system' },
]

export default function CaptainDashboard() {
  const [agents, setAgents] = useState(initialAgents.map(agent => ({ ...agent, status: 'Idle', progress: 0 })))
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [instruction, setInstruction] = useState('')
  const [histories, setHistories] = useState({})
  const [activities, setActivities] = useState(initialActivity)
  const [activeTab, setActiveTab] = useState('overview')
  const [brief, setBrief] = useState('')

  const runningCount = agents.filter(agent => agent.status === 'Running').length
  const addActivity = (title, detail, type = 'system') => {
    const time = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
    setActivities(items => [{ time, title, detail, type }, ...items])
  }
  const sendInstruction = event => {
    event.preventDefault()
    if (!instruction.trim() || !selectedAgent) return
    const task = { id: Date.now(), instruction: instruction.trim(), status: 'Queued', output: 'Waiting for the agent runtime to execute this task.', time: new Date().toLocaleString() }
    setHistories(items => ({ ...items, [selectedAgent.id]: [task, ...(items[selectedAgent.id] || [])] }))
    setAgents(items => items.map(agent => agent.id === selectedAgent.id ? { ...agent, status: 'Queued' } : agent))
    addActivity(`${selectedAgent.name} received an instruction`, instruction.trim(), 'success')
    setInstruction('')
  }
  const changeStatus = (id, status) => {
    const agent = agents.find(item => item.id === id)
    setAgents(items => items.map(item => item.id === id ? { ...item, status, progress: status === 'Running' ? 10 : 0 } : item))
    addActivity(`${agent.name}: ${status}`, status === 'Running' ? 'Marked as running in the dashboard.' : 'Status updated in the dashboard.')
  }
  const saveBrief = event => {
    event.preventDefault()
    if (!brief.trim()) return
    addActivity('Project brief saved', brief.trim(), 'success')
    setBrief('')
  }
  const visibleActivity = useMemo(() => activities, [activities])

  return (
    <main className="captain-shell">
      <aside className="captain-sidebar">
        <a className="captain-brand" href="#overview"><span className="brand-mark">A</span><span><strong>AVENGERS</strong><small>AI WORKSPACE</small></span></a>
        <div className="sidebar-label">WORKSPACE</div>
        <button className={`nav-link ${activeTab === 'overview' && !selectedAgent ? 'active' : ''}`} onClick={() => { setSelectedAgent(null); setActiveTab('overview') }}><span>▦</span> Overview</button>
        <button className={`nav-link ${activeTab === 'agents' && !selectedAgent ? 'active' : ''}`} onClick={() => { setSelectedAgent(null); setActiveTab('agents') }}><span>♙</span> Agent team <em>5</em></button>
        <button className={`nav-link ${activeTab === 'activity' && !selectedAgent ? 'active' : ''}`} onClick={() => { setSelectedAgent(null); setActiveTab('activity') }}><span>◷</span> Activity log</button>
        <div className="sidebar-bottom">
          <div className="captain-profile"><div className="captain-avatar">CA</div><div><strong>Captain America</strong><small>Project Manager</small></div><span className="online-dot" /></div>
          <div className="sidebar-footnote">AVENGERS CONTROL CENTER <span>v0.2</span></div>
        </div>
      </aside>

      <section className="captain-main">
        <header className="captain-topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>{selectedAgent ? selectedAgent.name : activeTab === 'overview' ? 'Overview' : activeTab === 'agents' ? 'Agent team' : 'Activity log'}</strong></div><div className="topbar-right"><span className="connection-indicator"><i /> Workspace ready</span><div className="topbar-avatar">CA</div></div></header>
        <div className="captain-content">
          {selectedAgent ? (
            <section className="agent-workspace">
              <button className="back-link" onClick={() => setSelectedAgent(null)}>← Back to team</button>
              <div className="agent-detail-heading">
                <div className={`agent-symbol large ${selectedAgent.tone}`}>{selectedAgent.icon}</div>
                <div><div className="eyebrow">AGENT WORKSPACE</div><h1>{selectedAgent.name}</h1><p>{selectedAgent.role} · {selectedAgent.detail}</p></div>
                <span className={`status-pill ${selectedAgent.status.toLowerCase()}`}>{selectedAgent.status}</span>
              </div>
              <section className="brief-panel instruction-panel">
                <div className="section-title"><div><span className="section-kicker">NEW INSTRUCTION</span><h2>Send a task</h2><p>Give this agent one instruction at a time.</p></div></div>
                <form className="brief-form" onSubmit={sendInstruction}>
                  <textarea value={instruction} onChange={event => setInstruction(event.target.value)} placeholder={`Tell ${selectedAgent.name} what to do...`} rows="3" />
                  <div className="brief-actions"><span>Task will be saved in this workspace.</span><button type="submit" disabled={!instruction.trim()}>Send instruction ↗</button></div>
                </form>
              </section>
              <div className="section-heading"><div><span className="section-kicker">TASK HISTORY</span><h2>Instructions & work</h2></div><span className="history-count">{(histories[selectedAgent.id] || []).length} tasks</span></div>
              {(histories[selectedAgent.id] || []).length ? <div className="task-list">{histories[selectedAgent.id].map(task => <article className="task-card" key={task.id}><div className="task-top"><strong>Instruction</strong><span className="status-pill">{task.status}</span></div><p className="task-instruction">{task.instruction}</p><div className="task-output"><span>AGENT UPDATE</span><p>{task.output}</p></div><time>{task.time}</time></article>)}</div> : <div className="empty-state"><span>✧</span><strong>No tasks yet</strong><p>Instructions and agent updates will appear here.</p></div>}
              <div className="runtime-note">Agent execution is not connected yet. Tasks are currently saved in this dashboard only.</div>
            </section>
          ) : activeTab === 'activity' ? (
            <section><div className="page-heading"><div><div className="eyebrow">MISSION FEED</div><h1>Activity log</h1><p>Recent instructions and workspace updates.</p></div></div><ActivityList activities={visibleActivity} /></section>
          ) : (
            <>
              <div className="page-heading"><div><div className="eyebrow">COMMAND CENTER <span>•</span> MAIN CONTROL</div><h1>Good day, Captain.</h1><p>Your team is ready. What's the mission?</p></div><div className="mission-chip"><span className="pulse-dot" /> SYSTEM STANDBY</div></div>
              <div className="stat-grid">
                <article className="stat-card"><span className="stat-icon purple">♙</span><div><small>TEAM MEMBERS</small><strong>05 <span>agents</span></strong></div><div className="stat-caption">Your full squad</div></article>
                <article className="stat-card"><span className="stat-icon blue">◉</span><div><small>RUNNING NOW</small><strong>{String(runningCount).padStart(2, '0')} <span>agents</span></strong></div><div className="stat-caption">Current agent status</div></article>
                <article className="stat-card"><span className="stat-icon green">✓</span><div><small>RECENT TASKS</small><strong>{Object.values(histories).reduce((sum, list) => sum + list.length, 0)}</strong></div><div className="stat-caption">Instructions assigned</div></article>
              </div>
              <section className="brief-panel"><div className="section-title"><div><span className="section-kicker">NEW MISSION</span><h2>Project brief</h2><p>Describe the goal for your Avengers team.</p></div><span className="brief-spark">✧</span></div><form className="brief-form" onSubmit={saveBrief}><textarea value={brief} onChange={event => setBrief(event.target.value)} placeholder="What are we building?" rows="2" /><div className="brief-actions"><span>Save a note for the team.</span><button type="submit" disabled={!brief.trim()}>Save brief ↗</button></div></form></section>
              <div className="section-heading"><div><span className="section-kicker">THE AVENGERS</span><h2>Your agent team</h2></div><span className="history-count">5 AGENTS</span></div>
              <div className="agent-grid">{agents.map(agent => <article className="agent-card clickable" key={agent.id} role="button" tabIndex={0} onClick={() => setSelectedAgent(agent)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setSelectedAgent(agent) }}>
                <div className="agent-card-top"><div className={`agent-symbol ${agent.tone}`}>{agent.icon}</div><span className={`status-pill ${agent.status.toLowerCase()}`}><i />{agent.status}</span></div>
                <h3>{agent.name}</h3><div className="agent-role">{agent.role}</div><p>{agent.detail}</p>
                <div className="agent-card-footer"><span className="agent-id">OPEN WORKSPACE</span><span className="open-arrow">↗</span></div>
              </article>)}</div>
              <section className="activity-panel"><div className="section-heading activity-heading"><div><span className="section-kicker">MISSION FEED</span><h2>Recent activity</h2></div><button className="text-action" onClick={() => setActiveTab('activity')}>See all →</button></div><ActivityList activities={activities.slice(0, 4)} compact /></section>
              <footer className="captain-footer"><span>AVENGERS AI WORKSPACE</span><span>One team. One mission. <b>✦</b></span></footer>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function ActivityList({ activities, compact = false }) {
  return <div className="activity-list">{activities.length ? activities.map((item, index) => <div className="activity-row" key={`${item.time}-${index}`}><span className={`activity-marker ${item.type}`} /><time>{item.time}</time><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>) : <div className="empty-state"><strong>No activity yet</strong></div>}</div>
}
