import { render, screen, fireEvent } from '@testing-library/react'
import { CardEditor } from '../CardEditor'
import { Card } from '../../types'

const mockCard: Card = {
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

describe('CardEditor', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock alert
    jest.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('new card creation', () => {
    it('renders empty form for new card', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByPlaceholderText('Card title')).toHaveValue('')
      expect(
        screen.getByPlaceholderText('Write your markdown content here...')
      ).toHaveValue('')
      expect(screen.getByPlaceholderText('tag1, tag2, tag3')).toHaveValue('')
      expect(screen.getByPlaceholderText('Username')).toHaveValue('')

      const dateInputs = screen.getAllByDisplayValue('')
      const dateInput = dateInputs.find(
        input => input.getAttribute('type') === 'date'
      )
      expect(dateInput).toHaveValue('')
      expect(dateInput).toHaveAttribute('type', 'date')

      expect(screen.getByText('create Card')).toBeInTheDocument()
    })

    it('validates title is required', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      const saveButton = screen.getByText('create Card')
      fireEvent.click(saveButton)

      expect(window.alert).toHaveBeenCalledWith('Title is required')
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('saves new card with valid data', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      fireEvent.change(screen.getByPlaceholderText('Card title'), {
        target: { value: 'New Card Title' },
      })
      fireEvent.change(
        screen.getByPlaceholderText('Write your markdown content here...'),
        {
          target: { value: 'New content' },
        }
      )
      fireEvent.change(screen.getByPlaceholderText('tag1, tag2, tag3'), {
        target: { value: 'tag1, tag2' },
      })
      fireEvent.change(screen.getByPlaceholderText('Username'), {
        target: { value: 'Jane Doe' },
      })

      const saveButton = screen.getByText('create Card')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Card Title',
        content: 'New content',
        metadata: {
          tags: ['tag1', 'tag2'],
          assignee: 'Jane Doe',
          dueDate: undefined,
        },
      })
    })
  })

  describe('editing existing card', () => {
    it('renders form with existing card data', () => {
      render(
        <CardEditor
          card={mockCard}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByPlaceholderText('Card title')).toHaveValue('Test Card')
      expect(
        screen.getByPlaceholderText('Write your markdown content here...')
      ).toHaveValue('Test content')
      expect(screen.getByPlaceholderText('tag1, tag2, tag3')).toHaveValue(
        'tag1, tag2'
      )
      expect(screen.getByPlaceholderText('Username')).toHaveValue('John Doe')
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('saves edited card', () => {
      render(
        <CardEditor
          card={mockCard}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.change(screen.getByPlaceholderText('Card title'), {
        target: { value: 'Updated Title' },
      })

      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Updated Title',
        content: 'Test content',
        metadata: {
          tags: ['tag1', 'tag2'],
          assignee: 'John Doe',
          dueDate: new Date('2023-12-31T00:00:00.000Z'),
        },
      })
    })
  })

  describe('form handling', () => {
    it('parses tags correctly', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      fireEvent.change(screen.getByPlaceholderText('Card title'), {
        target: { value: 'Test Title' },
      })
      fireEvent.change(screen.getByPlaceholderText('tag1, tag2, tag3'), {
        target: { value: '  tag1  ,  tag2 , , tag3  ' },
      })

      const saveButton = screen.getByText('create Card')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Title',
        content: '',
        metadata: {
          tags: ['tag1', 'tag2', 'tag3'],
          assignee: undefined,
          dueDate: undefined,
        },
      })
    })

    it('handles empty tags', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      fireEvent.change(screen.getByPlaceholderText('Card title'), {
        target: { value: 'Test Title' },
      })
      fireEvent.change(screen.getByPlaceholderText('tag1, tag2, tag3'), {
        target: { value: '   , ,   ' },
      })

      const saveButton = screen.getByText('create Card')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Title',
        content: '',
        metadata: {
          tags: [],
          assignee: undefined,
          dueDate: undefined,
        },
      })
    })

    it('handles empty assignee', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      fireEvent.change(screen.getByPlaceholderText('Card title'), {
        target: { value: 'Test Title' },
      })
      fireEvent.change(screen.getByPlaceholderText('Username'), {
        target: { value: '   ' },
      })

      const saveButton = screen.getByText('create Card')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Title',
        content: '',
        metadata: {
          tags: [],
          assignee: undefined,
          dueDate: undefined,
        },
      })
    })

    it('handles due date', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      fireEvent.change(screen.getByPlaceholderText('Card title'), {
        target: { value: 'Test Title' },
      })

      const dateInputs = screen.getAllByDisplayValue('')
      const dateInput = dateInputs.find(
        input => input.getAttribute('type') === 'date'
      )
      fireEvent.change(dateInput!, {
        target: { value: '2023-12-31' },
      })

      const saveButton = screen.getByText('create Card')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Title',
        content: '',
        metadata: {
          tags: [],
          assignee: undefined,
          dueDate: new Date('2023-12-31T00:00:00.000Z'),
        },
      })
    })
  })

  describe('event handling', () => {
    it('calls onCancel when cancel button is clicked', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when clicking outside', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      // Click outside the editor
      fireEvent.mouseDown(document.body)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('does not call onCancel when clicking inside', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      // Click inside the editor
      const editor = screen.getByText('Title').closest('div')
      fireEvent.mouseDown(editor!)

      expect(mockOnCancel).not.toHaveBeenCalled()
    })

    it('calls onCancel when escape key is pressed', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('does not call onCancel for other keys', () => {
      render(<CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      fireEvent.keyDown(document, { key: 'Enter' })

      expect(mockOnCancel).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('removes event listeners on unmount', () => {
      const { unmount } = render(
        <CardEditor onSave={mockOnSave} onCancel={mockOnCancel} />
      )

      // Spy on removeEventListener
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2) // mousedown and keydown
    })
  })
})
