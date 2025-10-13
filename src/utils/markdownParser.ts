import matter from 'gray-matter'
import { Card, CardMetadata } from '../types'

export interface ParsedMarkdown {
  title: string
  content: string
  metadata: CardMetadata
}

/**
 * Parse a markdown file with frontmatter
 * @param fileContent - Raw markdown file content
 * @param filePath - Path to the markdown file
 * @param columnId - Column ID (folder name)
 * @returns Parsed Card object
 */
export function parseMarkdown(
  fileContent: string,
  filePath: string,
  columnId: string
): Card {
  try {
    const { data, content } = matter(fileContent)

    // Extract title from frontmatter or first heading
    let title = data.title || 'Untitled'
    if (!data.title) {
      const headingMatch = content.match(/^#\s+(.+)$/m)
      if (headingMatch) {
        title = headingMatch[1]
      }
    }

    // Generate ID from filename
    const fileName = filePath.split('/').pop() || 'unknown'
    const id = fileName.replace(/\.md$/, '')

    // Parse metadata
    const metadata: CardMetadata = {
      created: data.created ? new Date(data.created) : new Date(),
      updated: data.updated ? new Date(data.updated) : new Date(),
      tags: data.tags || [],
      assignee: data.assignee,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    }

    return {
      id,
      title,
      content: content.trim(),
      column: columnId,
      filePath,
      metadata,
    }
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error)
    throw new Error(`Failed to parse markdown file: ${filePath}`)
  }
}

/**
 * Generate markdown content from a Card object
 * @param card - Card object to serialize
 * @returns Markdown file content with frontmatter
 */
export function serializeCard(card: Card): string {
  const frontmatter = {
    title: card.title,
    created: card.metadata.created.toISOString(),
    updated: new Date().toISOString(),
    ...(card.metadata.tags?.length && { tags: card.metadata.tags }),
    ...(card.metadata.assignee && { assignee: card.metadata.assignee }),
    ...(card.metadata.dueDate && {
      dueDate: card.metadata.dueDate.toISOString(),
    }),
  }

  return matter.stringify(card.content, frontmatter)
}

/**
 * Generate a unique filename for a new card
 * @param title - Card title
 * @returns Filename in format: {timestamp}-{slug}.md
 */
export function generateCardFilename(title: string): string {
  const timestamp = Date.now()
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  return `${timestamp}-${slug}.md`
}

/**
 * Validate markdown file structure
 * @param fileContent - Raw markdown content
 * @returns True if valid, false otherwise
 */
export function validateMarkdown(fileContent: string): boolean {
  try {
    matter(fileContent)
    return true
  } catch {
    return false
  }
}
