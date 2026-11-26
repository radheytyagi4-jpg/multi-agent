import AgentWorkspace from '../components/AgentWorkspace'

const agent = { id: 'tester', name: 'Hulk', role: 'QA Engineer · Tester', tone: 'green', icon: '⬡' }

export default function Hulk() {
  return <AgentWorkspace agent={agent} />
}
