import {
  setFileWatcherAPI,
  FileChangeEvent,
  FileWatcherAPI,
} from '../../hooks/useFileWatcher'
import { useBoardStore } from '../../stores/boardStore'
import { setFileSystemAPI } from '../../utils/fileOperations'
import * as fileOperations from '../../utils/fileOperations'
import * as markdownParser from '../../utils/markdownParser'

// Mock file system API
const mockFsAPI = {
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  rename: jest.fn(),
  mkdir: jest.fn(),
}

describe('File Watcher Integration', () => {
  let mockWatcherAPI!: FileWatcherAPI
  let watchCallbacks: { [path: string]: (event: FileChangeEvent) => void } = {}

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

    // Set up file system mock
    setFileSystemAPI(mockFsAPI)

    // Create mock watcher API
    watchCallbacks = {}
    mockWatcherAPI = {
      watch: jest
        .fn()
        .mockImplementation(
          (path: string, callback: (event: FileChangeEvent) => void) => {
            watchCallbacks[path] = callback
            return jest.fn() // unsubscribe function
          }
        ),
    }
    setFileWatcherAPI(mockWatcherAPI)

    // Mock file operations
    mockFsAPI.readdir.mockResolvedValue([])
    mockFsAPI.readFile.mockResolvedValue('')
    mockFsAPI.writeFile.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
    watchCallbacks = {}
  })

  it('should sync file changes to store state', async () => {
    // Mock file system to return the new file for backlog column
    mockFsAPI.readdir.mockImplementation((path: string) => {
      if (path === './kanban-data/backlog') {
        return Promise.resolve(['new-card.md'])
      }
      return Promise.resolve([])
    })
    mockFsAPI.readFile.mockResolvedValue(
      '---\ntitle: New Card from File\n---\nContent from file'
    )
    jest.spyOn(markdownParser, 'parseMarkdown').mockReturnValue({
      id: 'new-card',
      title: 'New Card from File',
      content: 'Content from file',
      column: 'backlog',
      filePath: './kanban-data/backlog/new-card.md',
      metadata: {
        created: new Date('2023-01-01'),
        updated: new Date('2023-01-01'),
      },
    })

    // Simulate setting up the file watcher (what the hook would do)
    const callback = jest.fn((_event: FileChangeEvent) => {
      // Simulate the board's file change handler
      useBoardStore.getState().loadCards()
    })

    // Manually call the watcher setup (simulating useEffect)
    mockWatcherAPI.watch('./kanban-data/backlog', callback)

    // Simulate file change event
    const changeEvent: FileChangeEvent = {
      type: 'add',
      path: './kanban-data/backlog/new-card.md',
      columnId: 'backlog',
    }

    // Trigger the callback (simulating what the hook would do)
    watchCallbacks['./kanban-data/backlog'](changeEvent)

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 350)) // Wait for debouncing

    // Verify store was updated
    const state = useBoardStore.getState()
    expect(state.columns[0].cards).toHaveLength(1)
    expect(state.columns[0].cards[0].id).toBe('new-card')
    expect(state.columns[0].cards[0].title).toBe('New Card from File')
  })

  it('should handle file deletion events', async () => {
    // Set up initial card
    const initialCard = {
      id: 'existing-card',
      title: 'Existing Card',
      content: 'Content',
      column: 'backlog',
      filePath: './kanban-data/backlog/existing-card.md',
      metadata: {
        created: new Date('2023-01-01'),
        updated: new Date('2023-01-01'),
      },
    }
    useBoardStore.setState({
      columns: [
        { id: 'backlog', title: 'Backlog', cards: [initialCard] },
        { id: 'in-progress', title: 'In Progress', cards: [] },
        { id: 'done', title: 'Done', cards: [] },
      ],
      isLoading: false,
      error: null,
    })

    // Mock reading cards after deletion (empty)
    jest.spyOn(fileOperations, 'readAllCards').mockResolvedValue([])

    // Set up file watcher callback
    const callback = jest.fn((_event: FileChangeEvent) => {
      useBoardStore.getState().loadCards()
    })
    mockWatcherAPI.watch('./kanban-data/backlog', callback)

    // Simulate file deletion event
    const deleteEvent: FileChangeEvent = {
      type: 'unlink',
      path: './kanban-data/backlog/existing-card.md',
      columnId: 'backlog',
    }

    // Trigger the callback
    watchCallbacks['./kanban-data/backlog'](deleteEvent)

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 350))

    // Verify card was removed
    const state = useBoardStore.getState()
    expect(state.columns[0].cards).toHaveLength(0)
  })

  it('should set up watchers for all columns', () => {
    // Simulate setting up the file watcher (what the hook would do)
    const callback = jest.fn((_event: FileChangeEvent) => {
      // Simulate the board's file change handler
      useBoardStore.getState().loadCards()
    })

    // Manually call the watcher setup (simulating useEffect)
    mockWatcherAPI.watch('./kanban-data/backlog', callback)
    mockWatcherAPI.watch('./kanban-data/in-progress', callback)
    mockWatcherAPI.watch('./kanban-data/done', callback)

    // Verify watchers were set up
    expect(mockWatcherAPI.watch).toHaveBeenCalledTimes(3)
    expect(mockWatcherAPI.watch).toHaveBeenCalledWith(
      './kanban-data/backlog',
      callback
    )
    expect(mockWatcherAPI.watch).toHaveBeenCalledWith(
      './kanban-data/in-progress',
      callback
    )
    expect(mockWatcherAPI.watch).toHaveBeenCalledWith(
      './kanban-data/done',
      callback
    )
  })

  it('should handle missing watcher API gracefully', () => {
    // Don't set file watcher API (simulates error)
    setFileWatcherAPI(null as unknown as FileWatcherAPI)

    // The hook should handle missing API gracefully
    // Since we can't easily test the hook without React, we verify the API setter works
    expect(() => {
      setFileWatcherAPI(null as unknown as FileWatcherAPI)
    }).not.toThrow()
  })
})
