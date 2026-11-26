import { useMemo, useState } from 'react'
import './CaptainDashboard.css'

const initialAgents = [
  { id: 'backend', name: 'Dr. Strange', role: 'Backend developer', detail: 'APIs, services & data layer', icon: '⌘', tone: 'violet', status: 'Idle', progress: 0 },
  { id: 'frontend', name: 'Wanda', role: 'Frontend developer', detail: 'React UI & user experience', icon: '✦', tone: 'pink', status: 'Idle', progress: 0 },
  { id: 'tester', name: 'Hulk', role: 'QA engineer · Tester', detail: 'Test plans, bugs & verification', icon: '⬡', tone: 'green', status: 'Ready', progress: 0 },
]

const initialActivity = [
  { time: '09:42', title: 'Workspace initialized', detail: 'Captain dashboard is ready.', type: 'system' },
  { time: '09:41', title: 'Team roster loaded', detail: 'Backend, Frontend and Tester agents are available.', type: 'success' },
]

export default function CaptainDashboard() {
  const [agents, setAgents] = useState(initialAgents)
  const [idea, setIdea] = useState('')
  const [activities, setActivities] = useState(initialActivity)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAgent, setSelectedAgent] = useState('all')

  const runningCount = agents.filter((agent) => agent.status === 'Running').length
  const addActivity = (title, detail, type = 'system') => {
    const time = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
    setActivities((items) => [{ time, title, detail, type }, ...items])
  }

  const startAgent = (id) => {
    const agent = agents.find((item) => item.id === id)
    setAgents((items) => items.map((item) => item.id === id ? { ...item, status: 'Running', progress: 12 } : item))
    addActivity(`${agent.name} started`, 'Marked as running in the dashboard. Connect the orchestration API to execute real tasks.', 'success')
  }

  const stopAgent = (id) => {
    const agent = agents.find((item) => item.id === id)
    setAgents((items) => items.map((item) => item.id === id ? { ...item, status: 'Idle', progress: 0 } : item))
    addActivity(`${agent.name} stopped`, 'Agent status changed to idle.', 'system')
  }

  const submitBrief = (event) => {
    event.preventDefault()
    if (!idea.trim()) return
    addActivity('Project brief saved', idea.trim(), 'success')
    setIdea('')
  }

  const visibleActivity = useMemo(() => selectedAgent === 'all' ? activities : activities.filter((item) => item.detail.toLowerCase().includes(selectedAgent)), [activities, selectedAgent])

  return (
    <main className="captain-shell">
      <aside className="captain-sidebar">
        <a className="captain-brand" href="#overview">
          <span className="brand-mark">A</span>
          <span><strong>AVENGERS</strong><small>AI WORKSPACE</small></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span>▦</span> Overview</button>
        <button className={`nav-link ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}><span>♙</span> Agent team <em>3</em></button>
        <button className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}><span>◷</span> Activity log</button>
        <div className="sidebar-bottom">
          <div className="captain-profile"><div className="captain-avatar">CA</div><div><strong>Captain America</strong><small>Project manager</small></div><span className="online-dot" /></div>
          <div className="sidebar-footnote">AVENGERS PROJECT<br/>CONTROL CENTER <span>v0.1</span></div>
        </div>
      </aside>

      <section className="captain-main">
        <header className="captain-topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <strong>{activeTab === 'overview' ? 'Overview' : activeTab === 'agents' ? 'Agent team' : 'Activity log'}</strong></div>
          <div className="topbar-right"><span className="connection-indicator"><i /> Local workspace</span><div className="topbar-avatar">CA</div></div>
        </header>

        <div className="captain-content">
          <div className="page-heading">
            <div><div className="eyebrow">COMMAND CENTER <span>•</span> MAIN CONTROL</div><h1>Good day, Captain.</h1><p>Coordinate your AI team and keep the mission moving.</p></div>
            <div className="mission-chip"><span className="pulse-dot" /> SYSTEM STANDBY</div>
          </div>

          <div className="stat-grid">
            <article className="stat-card"><span className="stat-icon purple">♙</span><div><small>TEAM MEMBERS</small><strong>03 <span>agents</span></strong></div><div className="stat-caption">Your active squad</div></article>
            <article className="stat-card"><span className="stat-icon blue">◉</span><div><small>RUNNING NOW</small><strong>{String(runningCount).padStart(2, '0')} <span>agents</span></strong></div><div className="stat-caption">Live task execution</div></article>
            <article className="stat-card"><span className="stat-icon green">✓</span><div><small>QA STATUS</small><strong>Ready</strong></div><div className="stat-caption">Hulk is standing by</div></article>
          </div>

          <section className="brief-panel">
            <div className="section-title"><div><span className="section-kicker">NEW MISSION</span><h2>What are we building?</h2><p>Give your team a clear project brief to get started.</p></div><span className="brief-spark">✧</span></div>
            <form className="brief-form" onSubmit={submitBrief}><textarea value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Describe your project, goals, features, or the problem you want to solve..." rows="3" /><div className="brief-actions"><span>Captain will coordinate the team workflow.</span><button type="submit" disabled={!idea.trim()}>Save project brief <span>↗</span></button></div></form>
          </section>

          <div className="section-heading"><div><span className="section-kicker">YOUR SQUAD</span><h2>Meet the team</h2></div><button className="text-action" onClick={() => setActiveTab('agents')}>View all agents <span>→</span></button></div>
          <div className="agent-grid">
            {agents.map((agent) => <article className="agent-card" key={agent.id}>
              <div className="agent-card-top"><div className={`agent-symbol ${agent.tone}`}>{agent.icon}</div><span className={`status-pill ${agent.status.toLowerCase()}`}><i />{agent.status}</span></div>
              <h3>{agent.name}</h3><div className="agent-role">{agent.role}</div><p>{agent.detail}</p>
              <div className="agent-progress"><div><span>Task progress</span><strong>{agent.progress}%</strong></div><div className="progress-track"><i style={{ width: `${agent.progress}%` }} /></div></div>
              <div className="agent-card-footer"><span className="agent-id">AGENT / {agent.id.toUpperCase()}</span>{agent.status === 'Running' ? <button className="stop-button" onClick={() => stopAgent(agent.id)}>Stop agent</button> : <button className="start-button" onClick={() => startAgent(agent.id)}>Start agent <span>→</span></button>}</div>
            </article>)}
          </div>

          <section className="activity-panel">
            <div className="section-heading activity-heading"><div><span className="section-kicker">MISSION FEED</span><h2>Recent activity</h2></div><button className="text-action" onClick={() => setActiveTab('activity')}>Open activity log <span>→</span></button></div>
            <div className="activity-list">{activities.slice(0, 4).map((item, index) => <div className="activity-row" key={`${item.time}-${index}`}><span className={`activity-marker ${item.type}`} /> <time>{item.time}</time><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}</div>
          </section>
          <footer className="captain-footer"><span>AVENGERS AI WORKSPACE</span><span>Built for coordinated execution <b>✦</b></span></footer>
        </div>
      </section>
    </main>
  )
}
