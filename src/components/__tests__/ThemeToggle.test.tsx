import { render, screen } from '@testing-library/react'
import { ThemeToggle } from '../ThemeToggle'

describe('ThemeToggle', () => {
  it('renders without crashing', () => {
    // Simple smoke test - just verify the component renders
    // Full functionality testing requires manual testing due to system preference APIs
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
