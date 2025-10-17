import { useBoardStore } from '../boardStore'
import * as fileOperations from '../../utils/fileOperations'

// Mock the file operations
jest.mock('../../utils/fileOperations')

// Mock card data
const mockCards = [
  {
    id: 'card-1',
    title: 'Test Card 1',
    content: 'Test content 1',
    column: 'backlog',
    filePath: './kanban-data/backlog/card-1.md',
    metadata: {
      created: new Date('2023-01-01T00:00:00.000Z'),
      updated: new Date('2023-01-02T00:00:00.000Z'),
    },
  },
  {
    id: 'card-2',
    title: 'Test Card 2',
    content: 'Test content 2',
    column: 'in-progress',
    filePath: './kanban-data/in-progress/card-2.md',
    metadata: {
      created: new Date('2023-01-01T00:00:00.000Z'),
      updated: new Date('2023-01-02T00:00:00.000Z'),
    },
  },
]

describe('boardStore', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Reset the store to initial state
    useBoardStore.setState({
      columns: [
        { id: 'backlog', title: 'Backlog', cards: [] },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })
  })

  describe('loadCards', () => {
    it('should load cards from file system', async () => {
      ;(fileOperations.readAllCards as jest.Mock).mockResolvedValue(mockCards)

      await useBoardStore.getState().loadCards()

      const state = useBoardStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.columns[0].cards).toHaveLength(1)
      expect(state.columns[1].cards).toHaveLength(1)
    })

    it('should handle errors when loading cards', async () => {
      ;(fileOperations.readAllCards as jest.Mock).mockRejectedValue(
        new Error('Failed to read')
      )

      await useBoardStore.getState().loadCards()

      const state = useBoardStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Failed to read')
    })
  })

  describe('addCard', () => {
    it('should add a new card to a column', async () => {
      const newCard = {
        ...mockCards[0],
        id: 'new-card',
        title: 'New Card',
        column: 'backlog',
      }

      ;(fileOperations.createCard as jest.Mock).mockResolvedValue(newCard)

      await useBoardStore.getState().addCard('New Card', 'backlog')

      const state = useBoardStore.getState()
      expect(state.columns[0].cards).toHaveLength(1)
      expect(state.columns[0].cards[0].title).toBe('New Card')
    })

    it('should handle errors when adding a card', async () => {
      ;(fileOperations.createCard as jest.Mock).mockRejectedValue(
        new Error('Failed to create')
      )

      await expect(
        useBoardStore.getState().addCard('New Card', 'backlog')
      ).rejects.toThrow('Failed to create')

      const state = useBoardStore.getState()
      expect(state.error).toBe('Failed to create')
    })
  })

  describe('updateCard', () => {
    it('should update an existing card', async () => {
      // First add a card to the store
      const newCard = {
        ...mockCards[0],
        id: 'update-card',
        title: 'Original Title',
        column: 'backlog',
      }

      ;(fileOperations.createCard as jest.Mock).mockResolvedValue(newCard)
      await useBoardStore.getState().addCard('Original Title', 'backlog')

      // Mock the update operation
      const updatedCard = { ...newCard, title: 'Updated Title' }
      ;(fileOperations.updateCard as jest.Mock).mockResolvedValue(updatedCard)

      // Update the card
      await useBoardStore
        .getState()
        .updateCard('update-card', { title: 'Updated Title' })

      const state = useBoardStore.getState()
      expect(state.columns[0].cards[0].title).toBe('Updated Title')
    })

    it('should handle errors when updating a card', async () => {
      ;(fileOperations.updateCard as jest.Mock).mockRejectedValue(
        new Error('Failed to update')
      )

      await expect(
        useBoardStore
          .getState()
          .updateCard('non-existent', { title: 'Updated Title' })
      ).rejects.toThrow('Failed to update')

      const state = useBoardStore.getState()
      expect(state.error).toBe('Failed to update')
    })
  })

  describe('moveCard', () => {
    it('should move a card between columns', async () => {
      // First add a card to the store
      const newCard = {
        ...mockCards[0],
        id: 'move-card',
        title: 'Move Card',
        column: 'backlog',
      }

      ;(fileOperations.createCard as jest.Mock).mockResolvedValue(newCard)
      await useBoardStore.getState().addCard('Move Card', 'backlog')

      // Mock the move operation
      const movedCard = { ...newCard, column: 'in-progress' }
      ;(fileOperations.moveCard as jest.Mock).mockResolvedValue(movedCard)

      // Move the card
      await useBoardStore.getState().moveCard('move-card', 'in-progress')

      const state = useBoardStore.getState()
      expect(state.columns[0].cards).toHaveLength(0)
      expect(state.columns[1].cards).toHaveLength(1)
      expect(state.columns[1].cards[0].column).toBe('in-progress')
    })

    it('should not move a card to the same column', async () => {
      // First add a card to the store
      const newCard = {
        ...mockCards[0],
        id: 'same-column-card',
        title: 'Same Column Card',
        column: 'backlog',
      }

      ;(fileOperations.createCard as jest.Mock).mockResolvedValue(newCard)
      await useBoardStore.getState().addCard('Same Column Card', 'backlog')

      // Move the card to the same column (should not do anything)
      await useBoardStore.getState().moveCard('same-column-card', 'backlog')

      const state = useBoardStore.getState()
      expect(state.columns[0].cards).toHaveLength(1)
      expect(state.columns[1].cards).toHaveLength(0)
    })
  })

  describe('deleteCard', () => {
    it('should delete a card', async () => {
      // First add a card to the store
      const newCard = {
        ...mockCards[0],
        id: 'delete-card',
        title: 'Delete Card',
        column: 'backlog',
      }

      ;(fileOperations.createCard as jest.Mock).mockResolvedValue(newCard)
      await useBoardStore.getState().addCard('Delete Card', 'backlog')

      // Mock the delete operation
      ;(fileOperations.deleteCard as jest.Mock).mockResolvedValue(undefined)

      // Delete the card
      await useBoardStore.getState().deleteCard('delete-card')

      const state = useBoardStore.getState()
      expect(state.columns[0].cards).toHaveLength(0)
    })

    it('should handle errors when deleting a card', async () => {
      ;(fileOperations.deleteCard as jest.Mock).mockRejectedValue(
        new Error('Failed to delete')
      )

      await expect(
        useBoardStore.getState().deleteCard('non-existent')
      ).rejects.toThrow('Failed to delete')

      const state = useBoardStore.getState()
      expect(state.error).toBe('Failed to delete')
    })
  })

  describe('syncFromFileSystem', () => {
    it('should sync cards from file system', () => {
      useBoardStore.getState().syncFromFileSystem(mockCards)

      const state = useBoardStore.getState()
      expect(state.columns[0].cards).toHaveLength(1)
      expect(state.columns[1].cards).toHaveLength(1)
      expect(state.columns[2].cards).toHaveLength(0)
    })
  })

  describe('setError', () => {
    it('should set an error message', () => {
      useBoardStore.getState().setError('Test error')

      const state = useBoardStore.getState()
      expect(state.error).toBe('Test error')
    })

    it('should clear an error message', () => {
      useBoardStore.getState().setError('Test error')
      useBoardStore.getState().setError(null)

      const state = useBoardStore.getState()
      expect(state.error).toBeNull()
    })
  })
})
