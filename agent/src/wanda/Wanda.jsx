import AgentWorkspace from '../components/AgentWorkspace'

const agent = { id: 'frontend', name: 'Wanda', role: 'Frontend Developer', tone: 'pink', icon: '✦' }

export default function Wanda() {
  return <AgentWorkspace agent={agent} />
}
