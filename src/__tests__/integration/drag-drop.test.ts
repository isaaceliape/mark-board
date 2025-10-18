import { useBoardStore } from '../../stores/boardStore'
import { setFileSystemAPI } from '../../utils/fileOperations'
import { setFileWatcherAPI } from '../../hooks/useFileWatcher'
import * as fileOperations from '../../utils/fileOperations'

// Mock file system API
const mockFsAPI = {
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  rename: jest.fn(),
  mkdir: jest.fn(),
}

// Mock file watcher API
const mockWatcherAPI = {
  watch: jest.fn(() => jest.fn()), // Return unsubscribe function
}

describe('Drag and Drop Integration', () => {
  beforeEach(() => {
    // Reset store state
    useBoardStore.setState({
      columns: [
        { id: 'backlog', title: 'Backlog', cards: [] },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })

    // Set up mocks
    setFileSystemAPI(mockFsAPI)
    setFileWatcherAPI(mockWatcherAPI)

    // Mock file system operations
    mockFsAPI.readdir.mockResolvedValue([])
    mockFsAPI.readFile.mockResolvedValue('')
    mockFsAPI.writeFile.mockResolvedValue(undefined)
    mockFsAPI.mkdir.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should move a card between columns successfully', async () => {
    // Mock initial cards
    const mockCard = {
      id: 'test-card-1',
      title: 'Test Card',
      content: 'Test content',
      column: 'backlog',
      filePath: './kanban-data/backlog/test-card-1.md',
      metadata: {
        created: new Date('2023-01-01'),
        updated: new Date('2023-01-01'),
      },
    }

    // Set up initial store state with a card
    useBoardStore.setState({
      columns: [
        {
          id: 'backlog',
          title: 'Backlog',
          cards: [mockCard],
        },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })

    // Mock file operations
    jest.spyOn(fileOperations, 'moveCard').mockResolvedValue({
      ...mockCard,
      column: 'in-progress',
      filePath: './kanban-data/in-progress/test-card-1.md',
      metadata: {
        ...mockCard.metadata,
        updated: new Date(),
      },
    })

    // Perform the move
    await useBoardStore.getState().moveCard('test-card-1', 'in-progress')

    // Verify the card was moved
    const state = useBoardStore.getState()
    expect(state.columns[0].cards).toHaveLength(0) // backlog empty
    expect(state.columns[1].cards).toHaveLength(1) // in-progress has card
    expect(state.columns[1].cards[0].id).toBe('test-card-1')
    expect(state.columns[1].cards[0].column).toBe('in-progress')
  })

  it('should handle move card errors gracefully', async () => {
    const mockCard = {
      id: 'test-card-2',
      title: 'Error Test Card',
      content: 'Test content',
      column: 'backlog',
      filePath: './kanban-data/backlog/test-card-2.md',
      metadata: {
        created: new Date('2023-01-01'),
        updated: new Date('2023-01-01'),
      },
    }

    useBoardStore.setState({
      columns: [
        {
          id: 'backlog',
          title: 'Backlog',
          cards: [mockCard],
        },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })

    // Mock moveCard to fail
    jest
      .spyOn(fileOperations, 'moveCard')
      .mockRejectedValue(new Error('Move failed'))

    // Attempt the move (expect it to throw)
    await expect(
      useBoardStore.getState().moveCard('test-card-2', 'in-progress')
    ).rejects.toThrow('Move failed')

    // Verify error was set despite the throw
    const state = useBoardStore.getState()
    expect(state.error).toBe('Move failed')

    // Card should remain in original position
    expect(state.columns[0].cards).toHaveLength(1)
    expect(state.columns[0].cards[0].id).toBe('test-card-2')
    expect(state.columns[1].cards).toHaveLength(0)
  })

  it('should prevent moving to the same column', async () => {
    const mockCard = {
      id: 'test-card-3',
      title: 'Same Column Card',
      content: 'Test content',
      column: 'backlog',
      filePath: './kanban-data/backlog/test-card-3.md',
      metadata: {
        created: new Date('2023-01-01'),
        updated: new Date('2023-01-01'),
      },
    }

    useBoardStore.setState({
      columns: [
        {
          id: 'backlog',
          title: 'Backlog',
          cards: [mockCard],
        },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })

    // Mock moveCard (should not be called)
    const mockMoveCard = jest.spyOn(fileOperations, 'moveCard')

    // Attempt to move to same column
    await useBoardStore.getState().moveCard('test-card-3', 'backlog')

    // moveCard should not be called for same column
    expect(mockMoveCard).not.toHaveBeenCalled()

    // State should remain unchanged
    const state = useBoardStore.getState()
    expect(state.columns[0].cards).toHaveLength(1)
    expect(state.columns[0].cards[0].column).toBe('backlog')
  })
})
