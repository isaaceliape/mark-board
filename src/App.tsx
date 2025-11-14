import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom'
import { Board } from './components/Board'
import { SearchFilter } from './components/SearchFilter'
import { ThemeToggle } from './components/ThemeToggle'
import { ThemeSelector } from './components/ThemeSelector'
import { CoCreator } from './components/CoCreator'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="flex space-x-4">
      <Link
        to="/"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          location.pathname === '/'
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            : 'text-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
        }`}
      >
        Board
      </Link>
      <Link
        to="/co-create"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          location.pathname === '/co-create'
            ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
            : 'text-text-secondary hover:text-accent-600 dark:hover:text-accent-400'
        }`}
      >
        Co-Create
      </Link>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-primary">
        <header className="bg-background-elevated shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                Mark Board
              </h1>
              <p className="text-sm text-text-secondary">
                Markdown-powered Kanban Board
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4">
              <Navigation />
              <div className="flex items-center space-x-2">
                <ThemeSelector />
                <ThemeToggle />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <SearchFilter />
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Board />} />
          <Route path="/co-create" element={<CoCreator />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
