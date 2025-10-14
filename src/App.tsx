import './App.css'
import { Board } from './components/Board'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Mark Board
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Markdown-powered Kanban Board
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <Board />
    </div>
  )
}

export default App
