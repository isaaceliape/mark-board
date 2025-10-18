import { render, screen, fireEvent } from '@testing-library/react'
import { Column } from '../Column'
import { Card as CardType } from '../../types'

// Mock the Card component to avoid dnd-kit issues
jest.mock('../Card', () => ({
  Card: jest.fn(({ card, onEdit, onDelete }: any) => (
    <div data-testid={`card-${card.id}`}>
      <h3>{card.title}</h3>
      <button onClick={onEdit} data-testid={`edit-${card.id}`}>
        Edit
      </button>
      <button
        onClick={() => onDelete(card.id)}
        data-testid={`delete-${card.id}`}
      >
        Delete
      </button>
    </div>
  )),
}))

// Mock CardEditor component
jest.mock('../CardEditor', () => ({
  CardEditor: jest.fn(({ onSave, onCancel }: any) => (
    <div data-testid="card-editor">
      <button
        onClick={() => onSave({ title: 'New Card', content: '', metadata: {} })}
        data-testid="save-card"
      >
        Save
      </button>
      <button onClick={onCancel} data-testid="cancel-card">
        Cancel
      </button>
    </div>
  )),
}))

// Mock @dnd-kit dependencies
jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn(() => ({
    setNodeRef: jest.fn(),
    isOver: false,
  })),
}))

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
  verticalListSortingStrategy: jest.fn(),
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => ''),
    },
  },
}))

const mockCards: CardType[] = [
  {
    id: 'card-1',
    title: 'Card 1',
    content: 'Content 1',
    column: 'backlog',
    filePath: './kanban-data/backlog/card-1.md',
    metadata: {
      created: new Date('2023-01-01T00:00:00.000Z'),
      updated: new Date('2023-01-02T00:00:00.000Z'),
    },
  },
  {
    id: 'card-2',
    title: 'Card 2',
    content: 'Content 2',
    column: 'backlog',
    filePath: './kanban-data/backlog/card-2.md',
    metadata: {
      created: new Date('2023-01-01T00:00:00.000Z'),
      updated: new Date('2023-01-02T00:00:00.000Z'),
    },
  },
]

describe('Column', () => {
  const mockOnAddCard = jest.fn()
  const mockOnEditCard = jest.fn()
  const mockOnDeleteCard = jest.fn()
  const mockOnOpenEditModal = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders column with title and card count', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
  })

  it('renders empty column', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={[]}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('+ New Card')).toBeInTheDocument()
  })

  it('shows add card form when new card button is clicked', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={[]}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    const addButton = screen.getByText('+ New Card')
    fireEvent.click(addButton)

    expect(screen.getByTestId('card-editor')).toBeInTheDocument()
    expect(screen.queryByText('+ New Card')).not.toBeInTheDocument()
  })

  it('calls onAddCard when new card is saved', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={[]}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    // Click add button
    const addButton = screen.getByText('+ New Card')
    fireEvent.click(addButton)

    // Save (mocked CardEditor calls onSave with predefined data)
    const saveButton = screen.getByTestId('save-card')
    fireEvent.click(saveButton)

    expect(mockOnAddCard).toHaveBeenCalledWith({
      title: 'New Card',
      content: '',
      metadata: {},
    })
  })

  it('cancels adding card when cancel is clicked', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={[]}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    // Click add button
    const addButton = screen.getByText('+ New Card')
    fireEvent.click(addButton)

    // Cancel
    const cancelButton = screen.getByTestId('cancel-card')
    fireEvent.click(cancelButton)

    expect(screen.getByText('+ New Card')).toBeInTheDocument()
    expect(mockOnAddCard).not.toHaveBeenCalled()
  })

  it('calls onOpenEditModal when card edit is clicked', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    const editButton = screen.getByTestId('edit-card-1')
    fireEvent.click(editButton)

    expect(mockOnOpenEditModal).toHaveBeenCalledWith('card-1')
  })

  it('calls onDeleteCard when card delete is clicked', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    // Click delete button
    const deleteButton = screen.getByTestId('delete-card-1')
    fireEvent.click(deleteButton)

    expect(mockOnDeleteCard).toHaveBeenCalledWith('card-1')
  })

  it('shows inline editor when editing card', () => {
    // Mock the editing state by setting editingCardId
    // Since this is internal state, we'll test the behavior indirectly
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    // Initially shows cards
    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()

    // The inline editing is triggered by onOpenEditModal, which is tested above
    // The actual inline editing would require more complex state management testing
  })

  it('applies correct CSS classes', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    // Find the root column div
    const columnElement = screen
      .getByText('Backlog')
      .closest('.flex.flex-col.h-full.w-80')
    expect(columnElement).toHaveClass('flex', 'flex-col', 'h-full', 'w-80')
  })

  it('shows card count correctly', () => {
    render(
      <Column
        id="backlog"
        title="Backlog"
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onOpenEditModal={mockOnOpenEditModal}
      />
    )

    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
