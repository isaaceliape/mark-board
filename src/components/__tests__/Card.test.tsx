import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Card } from '../Card'
import { Card as CardType } from '../../types'
import { vi } from 'vitest'

// Mock @dnd-kit dependencies
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}))

const mockCard: CardType = {
  id: 'test-card',
  title: 'Test Card',
  content: 'Test content',
  column: 'backlog',
  filePath: './kanban-data/backlog/test-card.md',
  metadata: {
    created: new Date('2023-01-01T00:00:00.000Z'),
    updated: new Date('2023-01-02T00:00:00.000Z'),
    tags: ['tag1', 'tag2'],
    assignee: 'John Doe',
    dueDate: new Date('2023-12-31T00:00:00.000Z'),
  },
}

const mockCardMinimal: CardType = {
  id: 'minimal-card',
  title: 'Minimal Card',
  content: '',
  column: 'backlog',
  filePath: './kanban-data/backlog/minimal-card.md',
  metadata: {
    created: new Date('2023-01-01T00:00:00.000Z'),
    updated: new Date('2023-01-02T00:00:00.000Z'),
  },
}

describe('Card', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders card with all metadata', () => {
    render(<Card card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Due Dec 31')).toBeInTheDocument()
  })

  it('renders card with minimal metadata', () => {
    render(
      <Card
        card={mockCardMinimal}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Minimal Card')).toBeInTheDocument()
    expect(screen.queryByText('Test content')).not.toBeInTheDocument()
    expect(screen.queryByText('tag1')).not.toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('calls onEdit when title is clicked', () => {
    render(<Card card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    const title = screen.getByText('Test Card')
    fireEvent.click(title)

    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit when content is clicked', () => {
    render(<Card card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    const content = screen.getByText('Test content')
    fireEvent.click(content)

    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('shows delete confirmation on first click', () => {
    render(<Card card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByTitle('Delete card')
    fireEvent.click(deleteButton)

    expect(screen.getByText('Confirm?')).toBeInTheDocument()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('calls onDelete on second click within 3 seconds', async () => {
    render(<Card card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByTitle('Delete card')
    fireEvent.click(deleteButton)

    expect(screen.getByText('Confirm?')).toBeInTheDocument()

    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('test-card')
  })

  it('resets delete confirmation after 3 seconds', async () => {
    render(<Card card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByTitle('Delete card')
    fireEvent.click(deleteButton)

    expect(screen.getByText('Confirm?')).toBeInTheDocument()

    // Wait for the timeout
    await waitFor(
      () => {
        expect(screen.getByText('×')).toBeInTheDocument()
      },
      { timeout: 3100 }
    )

    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('prevents event propagation on delete button click', () => {
    render(<Card card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByTitle('Delete card')

    // Click the delete button - it should not trigger onEdit
    fireEvent.click(deleteButton)

    expect(mockOnEdit).not.toHaveBeenCalled()
  })

  it('applies correct CSS classes', () => {
    render(<Card card={mockCard} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    // Find the card container (the outermost div with the card classes)
    const cardElement =
      screen.getByText('Test Card').parentElement?.parentElement
    expect(cardElement).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'shadow-sm'
    )
  })
})
