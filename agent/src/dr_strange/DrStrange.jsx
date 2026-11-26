import AgentWorkspace from '../components/AgentWorkspace'

const agent = { id: 'backend', name: 'Dr. Strange', role: 'Backend Developer', tone: 'violet', icon: '◈' }

export default function DrStrange() {
  return <AgentWorkspace agent={agent} />
}
