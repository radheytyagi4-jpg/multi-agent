import './CaptainDashboard.css'

const agents = [
  { id: 'architect', name: 'Iron Man', role: 'System Architect', detail: 'Designs systems and technical plans', icon: '⌘', tone: 'orange' },
  { id: 'frontend', name: 'Wanda', role: 'Frontend Developer', detail: 'Builds the interface and experience', icon: '✦', tone: 'pink' },
  { id: 'backend', name: 'Dr. Strange', role: 'Backend Developer', detail: 'Builds APIs and backend services', icon: '◈', tone: 'violet' },
  { id: 'tester', name: 'Hulk', role: 'QA Engineer · Tester', detail: 'Tests features and reports bugs', icon: '⬡', tone: 'green' },
  { id: 'devops', name: 'Thor', role: 'DevOps Engineer', detail: 'Handles deployment and infrastructure', icon: '⚡', tone: 'blue' },
]

export default function CaptainDashboard({ onOpenAgent }) {
  return <main className="captain-shell">
    <aside className="captain-sidebar">
      <a className="captain-brand" href="#overview"><span className="brand-mark">A</span><span><strong>AVENGERS</strong><small>AI WORKSPACE</small></span></a>
      <div className="sidebar-label">WORKSPACE</div>
      <div className="nav-link active"><span>▦</span> Overview</div>
      <div className="nav-link"><span>♙</span> Agent team <em>5</em></div>
      <div className="sidebar-bottom">
        <div className="captain-profile"><div className="captain-avatar">CA</div><div><strong>Captain America</strong><small>Project Manager</small></div><span className="online-dot" /></div>
        <div className="sidebar-footnote">AVENGERS CONTROL CENTER <span>v0.3</span></div>
      </div>
    </aside>
    <section className="captain-main">
      <header className="captain-topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>Overview</strong></div><div className="topbar-right"><span className="connection-indicator"><i /> Backend not connected</span><div className="topbar-avatar">CA</div></div></header>
      <div className="captain-content">
        <div className="page-heading"><div><div className="eyebrow">COMMAND CENTER <span>•</span> MAIN CONTROL</div><h1>Good day, Captain.</h1><p>Your team is ready. Choose an agent to open its dedicated workspace.</p></div><div className="mission-chip"><span className="pulse-dot" /> TEAM STANDBY</div></div>
        <div className="stat-grid">
          <article className="stat-card"><span className="stat-icon purple">♙</span><div><small>TEAM MEMBERS</small><strong>05 <span>agents</span></strong></div><div className="stat-caption">Your full squad</div></article>
          <article className="stat-card"><span className="stat-icon blue">◉</span><div><small>BACKEND STATUS</small><strong>Offline</strong></div><div className="stat-caption">Connect API to enable tasks</div></article>
          <article className="stat-card"><span className="stat-icon green">✓</span><div><small>WORKSPACES</small><strong>05</strong></div><div className="stat-caption">Separate agent modules</div></article>
        </div>
        <div className="section-heading"><div><span className="section-kicker">THE AVENGERS</span><h2>Your agent team</h2></div><span className="history-count">5 AGENTS</span></div>
        <div className="agent-grid">{agents.map(agent => <article className="agent-card clickable" key={agent.id} role="button" tabIndex={0} onClick={() => onOpenAgent(agent.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onOpenAgent(agent.id) }}>
          <div className="agent-card-top"><div className={`agent-symbol ${agent.tone}`}>{agent.icon}</div><span className="status-pill">Not connected</span></div>
          <h3>{agent.name}</h3><div className="agent-role">{agent.role}</div><p>{agent.detail}</p>
          <div className="agent-card-footer"><span className="agent-id">OPEN WORKSPACE</span><span className="open-arrow">↗</span></div>
        </article>)}</div>
        <div className="runtime-note">Captain America manages the team dashboard and navigation. Each agent's instructions and task history are handled by that agent's own workspace and backend API.</div>
        <footer className="captain-footer"><span>AVENGERS AI WORKSPACE</span><span>One team. One mission. <b>✦</b></span></footer>
      </div>
    </section>
  </main>
}
