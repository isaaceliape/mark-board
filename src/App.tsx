import './App.css'
import { Board } from './components/Board'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Mark Board</h1>
        <p className="text-sm text-gray-600">Markdown-powered Kanban Board</p>
      </header>
      <Board />
    </div>
  )
}

export default App
