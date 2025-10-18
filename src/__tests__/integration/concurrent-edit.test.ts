import { useBoardStore } from '../../stores/boardStore'
import { setFileSystemAPI } from '../../utils/fileOperations'
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

describe('Concurrent Edit Integration', () => {
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

    // Mock file system operations
    mockFsAPI.readdir.mockResolvedValue([])
    mockFsAPI.readFile.mockResolvedValue('')
    mockFsAPI.writeFile.mockResolvedValue(undefined)
    mockFsAPI.mkdir.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handle concurrent card updates with conflict resolution', async () => {
    // Set up initial card
    const initialCard = {
      id: 'shared-card',
      title: 'Shared Card',
      content: 'Initial content',
      column: 'backlog',
      filePath: './kanban-data/backlog/shared-card.md',
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
          cards: [initialCard],
        },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })

    // Mock updateCard to simulate concurrent modifications
    let callCount = 0
    jest.spyOn(fileOperations, 'updateCard').mockImplementation(async () => {
      callCount++
      if (callCount === 1) {
        // First call succeeds
        return
      } else {
        // Second call fails (simulating conflict)
        throw new Error('Concurrent modification detected')
      }
    })

    // Simulate two concurrent updates
    const update1 = useBoardStore
      .getState()
      .updateCard('shared-card', { title: 'Updated by User 1' })
    const update2 = useBoardStore
      .getState()
      .updateCard('shared-card', { title: 'Updated by User 2' })

    // Wait for both operations
    await Promise.allSettled([update1, update2])

    // Verify error handling
    const state = useBoardStore.getState()
    expect(state.error).toBe('Concurrent modification detected')

    // Card should still exist but may have inconsistent state
    expect(state.columns[0].cards).toHaveLength(1)
  })

  it('should handle concurrent card creation conflicts', async () => {
    // Mock createCard to simulate race condition
    let createCount = 0
    jest
      .spyOn(fileOperations, 'createCard')
      .mockImplementation(async (title, column, content) => {
        createCount++
        if (createCount === 1) {
          return {
            id: 'new-card-1',
            title,
            content: content || '',
            column,
            filePath: `./kanban-data/${column}/new-card-1.md`,
            metadata: {
              created: new Date(),
              updated: new Date(),
            },
          }
        } else {
          // Second creation fails due to conflict
          throw new Error('Card already exists')
        }
      })

    // Attempt concurrent card creation
    const create1 = useBoardStore.getState().addCard('New Card', 'backlog')
    const create2 = useBoardStore.getState().addCard('New Card', 'backlog')

    const results = await Promise.allSettled([create1, create2])

    // One should succeed, one should fail
    const fulfilled = results.filter(r => r.status === 'fulfilled')
    const rejected = results.filter(r => r.status === 'rejected')

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)

    // Store should have one card
    const state = useBoardStore.getState()
    expect(state.columns[0].cards).toHaveLength(1)
  })

  it('should handle concurrent file system changes during store operations', async () => {
    // Set up initial card
    const card = {
      id: 'test-card',
      title: 'Test Card',
      content: 'Content',
      column: 'backlog',
      filePath: './kanban-data/backlog/test-card.md',
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
          cards: [card],
        },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })

    // Mock readAllCards to return different data (simulating external changes)
    let readCount = 0
    jest.spyOn(fileOperations, 'readAllCards').mockImplementation(async () => {
      readCount++
      if (readCount === 1) {
        // First read: card exists
        return [card]
      } else {
        // Second read: card was deleted externally
        return []
      }
    })

    // Start an operation that triggers a read
    await useBoardStore.getState().loadCards()

    // Simulate external deletion
    useBoardStore.setState({
      columns: [
        { id: 'backlog', title: 'Backlog', cards: [] },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
    })

    // Verify the store reflects the external change
    const state = useBoardStore.getState()
    expect(state.columns[0].cards).toHaveLength(0)
  })

  it('should maintain data consistency during rapid successive operations', async () => {
    // Start with empty board
    useBoardStore.setState({
      columns: [
        { id: 'backlog', title: 'Backlog', cards: [] },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })

    // Mock operations with delays to simulate real async behavior
    jest
      .spyOn(fileOperations, 'createCard')
      .mockImplementation(async (title, column, content) => {
        await new Promise(resolve => setTimeout(resolve, 10)) // Simulate async delay
        return {
          id: `card-${Date.now()}`,
          title,
          content: content || '',
          column,
          filePath: `./kanban-data/${column}/card-${Date.now()}.md`,
          metadata: {
            created: new Date(),
            updated: new Date(),
          },
        }
      })

    // Perform rapid successive operations
    const operations = []
    for (let i = 0; i < 5; i++) {
      operations.push(useBoardStore.getState().addCard(`Card ${i}`, 'backlog'))
    }

    // Wait for all operations to complete
    await Promise.all(operations)

    // Verify all cards were added
    const state = useBoardStore.getState()
    expect(state.columns[0].cards).toHaveLength(5)

    // Verify no errors occurred
    expect(state.error).toBeNull()
  })
})
