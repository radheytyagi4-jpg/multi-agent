import AgentWorkspace from '../components/AgentWorkspace'

const agent = { id: 'architect', name: 'Iron Man', role: 'System Architect', tone: 'orange', icon: '⌘' }

export default function IronMan() {
  return <AgentWorkspace agent={agent} />
}
