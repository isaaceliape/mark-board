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
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        Board
      </Link>
      <Link
        to="/co-create"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          location.pathname === '/co-create'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Mark Board
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
