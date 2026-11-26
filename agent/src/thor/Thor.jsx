import AgentWorkspace from '../components/AgentWorkspace'

const agent = { id: 'devops', name: 'Thor', role: 'DevOps Engineer', tone: 'blue', icon: '⚡' }

export default function Thor() {
  return <AgentWorkspace agent={agent} />
}
