import { useState } from 'react'
import CaptainDashboard from './captain/CaptainDashboard'
import IronMan from './ironman/IronMan'
import Wanda from './wanda/Wanda'
import DrStrange from './dr_strange/DrStrange'
import Hulk from './hulk/Hulk'
import Thor from './thor/Thor'

const workspaces = {
  architect: IronMan,
  frontend: Wanda,
  backend: DrStrange,
  tester: Hulk,
  devops: Thor,
}

function App() {
  const [activeAgent, setActiveAgent] = useState(null)
  const ActiveWorkspace = activeAgent ? workspaces[activeAgent] : null

  return ActiveWorkspace
    ? <main className="captain-shell">
        <aside className="captain-sidebar">
          <a className="captain-brand" href="#home" onClick={event => { event.preventDefault(); setActiveAgent(null) }}><span className="brand-mark">A</span><span><strong>AVENGERS</strong><small>AI WORKSPACE</small></span></a>
          <div className="sidebar-label">WORKSPACE</div>
          <button className="nav-link" onClick={() => setActiveAgent(null)}><span>▦</span> Overview</button>
          <div className="sidebar-bottom"><div className="captain-profile"><div className="captain-avatar">CA</div><div><strong>Captain America</strong><small>Project Manager</small></div><span className="online-dot" /></div><div className="sidebar-footnote">AVENGERS CONTROL CENTER <span>v0.3</span></div></div>
        </aside>
        <section className="captain-main">
          <header className="captain-topbar"><div className="breadcrumbs"><button className="breadcrumb-back" onClick={() => setActiveAgent(null)}>Workspace</button> <span>/</span> <strong>Agent</strong></div><div className="topbar-right"><span className="connection-indicator"><i /> API connection required</span><div className="topbar-avatar">CA</div></div></header>
          <div className="captain-content"><button className="back-link" onClick={() => setActiveAgent(null)}>← Back to team</button><ActiveWorkspace /></div>
        </section>
      </main>
    : <CaptainDashboard onOpenAgent={setActiveAgent} />
}

export default App
