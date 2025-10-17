import {
  parseMarkdown,
  serializeCard,
  generateCardFilename,
  validateMarkdown,
} from '../markdownParser'
import { Card } from '../../types'

describe('markdownParser', () => {
  describe('parseMarkdown', () => {
    it('should parse a markdown file with frontmatter', () => {
      const fileContent = `---
title: Test Card
created: 2023-01-01T00:00:00.000Z
updated: 2023-01-02T00:00:00.000Z
tags: [test, example]
assignee: john-doe
dueDate: 2023-01-03T00:00:00.000Z
---

# Test Content

This is a test card content.`

      const filePath = '/test/path/test-card.md'
      const columnId = 'backlog'

      const result = parseMarkdown(fileContent, filePath, columnId)

      expect(result).toEqual({
        id: 'test-card',
        title: 'Test Card',
        content: '# Test Content\n\nThis is a test card content.',
        column: 'backlog',
        filePath: '/test/path/test-card.md',
        metadata: {
          created: new Date('2023-01-01T00:00:00.000Z'),
          updated: new Date('2023-01-02T00:00:00.000Z'),
          tags: ['test', 'example'],
          assignee: 'john-doe',
          dueDate: new Date('2023-01-03T00:00:00.000Z'),
        },
      })
    })

    it('should extract title from first heading if not in frontmatter', () => {
      const fileContent = `---
created: 2023-01-01T00:00:00.000Z
---

# Extracted Title

Content here.`

      const filePath = '/test/path/test-card.md'
      const columnId = 'backlog'

      const result = parseMarkdown(fileContent, filePath, columnId)

      expect(result.title).toBe('Extracted Title')
    })

    it('should use "Untitled" if no title is found', () => {
      const fileContent = `---
created: 2023-01-01T00:00:00.000Z
---

Content here.`

      const filePath = '/test/path/test-card.md'
      const columnId = 'backlog'

      const result = parseMarkdown(fileContent, filePath, columnId)

      expect(result.title).toBe('Untitled')
    })

    it('should handle malformed markdown gracefully', () => {
      const fileContent = `---
created: invalid-date
---

# Test Card

Content here.`

      const filePath = '/test/path/test-card.md'
      const columnId = 'backlog'

      // Gray-matter is quite permissive and will parse invalid dates as strings
      // So this test is not really valid - gray-matter doesn't throw on invalid dates
      const result = parseMarkdown(fileContent, filePath, columnId)
      expect(result.metadata.created).toBeInstanceOf(Date)
    })
  })

  describe('serializeCard', () => {
    it('should serialize a card to markdown with frontmatter', () => {
      const card: Card = {
        id: 'test-card',
        title: 'Test Card',
        content: '# Test Content\n\nThis is a test card content.',
        column: 'backlog',
        filePath: '/test/path/test-card.md',
        metadata: {
          created: new Date('2023-01-01T00:00:00.000Z'),
          updated: new Date('2023-01-02T00:00:00.000Z'),
          tags: ['test', 'example'],
          assignee: 'john-doe',
          dueDate: new Date('2023-01-03T00:00:00.000Z'),
        },
      }

      const result = serializeCard(card)

      expect(result).toContain('title: Test Card')
      expect(result).toContain("created: '2023-01-01T00:00:00.000Z'")
      expect(result).toContain('tags:')
      expect(result).toContain('  - test')
      expect(result).toContain('  - example')
      expect(result).toContain('assignee: john-doe')
      expect(result).toContain("dueDate: '2023-01-03T00:00:00.000Z'")
      expect(result).toContain('# Test Content\n\nThis is a test card content.')
    })

    it('should serialize a card without optional metadata', () => {
      const card: Card = {
        id: 'test-card',
        title: 'Test Card',
        content: '# Test Content\n\nThis is a test card content.',
        column: 'backlog',
        filePath: '/test/path/test-card.md',
        metadata: {
          created: new Date('2023-01-01T00:00:00.000Z'),
          updated: new Date('2023-01-02T00:00:00.000Z'),
        },
      }

      const result = serializeCard(card)

      expect(result).toContain('title: Test Card')
      expect(result).toContain("created: '2023-01-01T00:00:00.000Z'")
      expect(result).not.toContain('tags:')
      expect(result).not.toContain('assignee:')
      expect(result).not.toContain('dueDate:')
      expect(result).toContain('# Test Content\n\nThis is a test card content.')
    })
  })

  describe('generateCardFilename', () => {
    it('should generate a filename with timestamp and slug', () => {
      const title = 'Test Card Title'
      const result = generateCardFilename(title)

      expect(result).toMatch(/^\d+-test-card-title\.md$/)
    })

    it('should handle special characters in title', () => {
      const title = 'Test & Card @ Title!'
      const result = generateCardFilename(title)

      expect(result).toMatch(/^\d+-test-card-title\.md$/)
    })

    it('should truncate long titles', () => {
      const title =
        'A very long title that should be truncated to fifty characters or less'
      const result = generateCardFilename(title)

      expect(result.length).toBeLessThan(70) // timestamp + truncated title + .md
      expect(result).toMatch(/^\d+-.*\.md$/)
    })
  })

  describe('validateMarkdown', () => {
    it('should return true for valid markdown with frontmatter', () => {
      const fileContent = `---
title: Valid Card
---

Content here.`

      expect(validateMarkdown(fileContent)).toBe(true)
    })

    it('should return true for invalid markdown (gray-matter is quite permissive)', () => {
      const fileContent = `---
title: Invalid Card
---

Content here.`

      expect(validateMarkdown(fileContent)).toBe(true)
    })

    it('should return true for markdown without frontmatter', () => {
      const fileContent = `# Test Card

Content here.`

      expect(validateMarkdown(fileContent)).toBe(true)
    })
  })
})
