import {
  readCardsFromColumn,
  readAllCards,
  writeCard,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  ensureColumnsExist,
  setFileSystemAPI,
} from '../fileOperations'
import { Card } from '../../types'

// Mock file system API
const mockFsAPI = {
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  rename: jest.fn(),
  mkdir: jest.fn(),
}

describe('fileOperations', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    setFileSystemAPI(mockFsAPI)
  })

  describe('readCardsFromColumn', () => {
    it('should read and parse markdown files from a column directory', async () => {
      const mockFiles = ['card1.md', 'card2.md', 'not-a-card.txt']
      const mockContent1 = `---
title: Card 1
created: 2023-01-01T00:00:00.000Z
---

Content 1`
      const mockContent2 = `---
title: Card 2
created: 2023-01-02T00:00:00.000Z
---

Content 2`

      mockFsAPI.readdir.mockResolvedValue(mockFiles)
      mockFsAPI.readFile
        .mockResolvedValueOnce(mockContent1)
        .mockResolvedValueOnce(mockContent2)

      const result = await readCardsFromColumn('backlog')

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Card 1')
      expect(result[1].title).toBe('Card 2')
      expect(mockFsAPI.readdir).toHaveBeenCalledWith('./kanban-data/backlog')
    })

    it('should handle errors when reading files', async () => {
      const mockFiles = ['card1.md', 'card2.md']
      const mockContent1 = `---
title: Card 1
created: 2023-01-01T00:00:00.000Z
---

Content 1`

      mockFsAPI.readdir.mockResolvedValue(mockFiles)
      mockFsAPI.readFile
        .mockResolvedValueOnce(mockContent1)
        .mockRejectedValueOnce(new Error('File not found'))

      const result = await readCardsFromColumn('backlog')

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Card 1')
    })
  })

  describe('readAllCards', () => {
    it('should read cards from all columns', async () => {
      const mockFiles1 = ['card1.md']
      const mockFiles2 = ['card2.md']
      const mockContent1 = `---
title: Card 1
created: 2023-01-01T00:00:00.000Z
---

Content 1`
      const mockContent2 = `---
title: Card 2
created: 2023-01-02T00:00:00.000Z
---

Content 2`

      mockFsAPI.readdir
        .mockResolvedValueOnce(mockFiles1)
        .mockResolvedValueOnce(mockFiles2)
      mockFsAPI.readFile
        .mockResolvedValueOnce(mockContent1)
        .mockResolvedValueOnce(mockContent2)

      const result = await readAllCards(['backlog', 'in-progress'])

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Card 1')
      expect(result[1].title).toBe('Card 2')
    })
  })

  describe('writeCard', () => {
    it('should serialize and write a card to file', async () => {
      const card: Card = {
        id: 'test-card',
        title: 'Test Card',
        content: 'Test content',
        column: 'backlog',
        filePath: './kanban-data/backlog/test-card.md',
        metadata: {
          created: new Date('2023-01-01T00:00:00.000Z'),
          updated: new Date('2023-01-02T00:00:00.000Z'),
        },
      }

      await writeCard(card)

      expect(mockFsAPI.writeFile).toHaveBeenCalledWith(
        './kanban-data/backlog/test-card.md',
        expect.stringContaining('title: Test Card')
      )
    })
  })

  describe('createCard', () => {
    it('should create a new card with generated filename', async () => {
      mockFsAPI.writeFile.mockResolvedValue(undefined)

      const result = await createCard('New Card', 'backlog', 'New content')

      expect(result.title).toBe('New Card')
      expect(result.content).toBe('New content')
      expect(result.column).toBe('backlog')
      expect(result.filePath).toContain('./kanban-data/backlog/')
      expect(mockFsAPI.writeFile).toHaveBeenCalled()
    })
  })

  describe('updateCard', () => {
    it('should update a card and write to file', async () => {
      const card: Card = {
        id: 'test-card',
        title: 'Test Card',
        content: 'Test content',
        column: 'backlog',
        filePath: './kanban-data/backlog/test-card.md',
        metadata: {
          created: new Date('2023-01-01T00:00:00.000Z'),
          updated: new Date('2023-01-02T00:00:00.000Z'),
        },
      }

      await updateCard(card)

      expect(card.metadata.updated).toBeInstanceOf(Date)
      expect(mockFsAPI.writeFile).toHaveBeenCalled()
    })
  })

  describe('deleteCard', () => {
    it('should delete a card file', async () => {
      const card: Card = {
        id: 'test-card',
        title: 'Test Card',
        content: 'Test content',
        column: 'backlog',
        filePath: './kanban-data/backlog/test-card.md',
        metadata: {
          created: new Date('2023-01-01T00:00:00.000Z'),
          updated: new Date('2023-01-02T00:00:00.000Z'),
        },
      }

      await deleteCard(card)

      expect(mockFsAPI.unlink).toHaveBeenCalledWith(
        './kanban-data/backlog/test-card.md'
      )
    })
  })

  describe('moveCard', () => {
    it('should move a card to a different column', async () => {
      const card: Card = {
        id: 'test-card',
        title: 'Test Card',
        content: 'Test content',
        column: 'backlog',
        filePath: './kanban-data/backlog/test-card.md',
        metadata: {
          created: new Date('2023-01-01T00:00:00.000Z'),
          updated: new Date('2023-01-02T00:00:00.000Z'),
        },
      }

      mockFsAPI.rename.mockResolvedValue(undefined)

      const result = await moveCard(card, 'in-progress')

      expect(result.column).toBe('in-progress')
      expect(result.filePath).toBe('./kanban-data/in-progress/test-card.md')
      expect(result.metadata.updated).toBeInstanceOf(Date)
      expect(mockFsAPI.rename).toHaveBeenCalledWith(
        './kanban-data/backlog/test-card.md',
        './kanban-data/in-progress/test-card.md'
      )
    })
  })

  describe('ensureColumnsExist', () => {
    it('should create directories for all columns', async () => {
      mockFsAPI.mkdir.mockResolvedValue(undefined)

      await ensureColumnsExist(['backlog', 'in-progress', 'done'])

      expect(mockFsAPI.mkdir).toHaveBeenCalledTimes(3)
      expect(mockFsAPI.mkdir).toHaveBeenCalledWith('./kanban-data/backlog', {
        recursive: true,
      })
      expect(mockFsAPI.mkdir).toHaveBeenCalledWith(
        './kanban-data/in-progress',
        {
          recursive: true,
        }
      )
      expect(mockFsAPI.mkdir).toHaveBeenCalledWith('./kanban-data/done', {
        recursive: true,
      })
    })

    it('should handle errors when creating directories', async () => {
      mockFsAPI.mkdir.mockRejectedValue(new Error('Directory exists'))

      // Should not throw an error even if mkdir fails
      await expect(
        ensureColumnsExist(['backlog', 'in-progress', 'done'])
      ).resolves.toBeUndefined()
    })
  })
})
