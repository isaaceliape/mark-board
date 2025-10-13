import { Card } from '../types'
import {
  parseMarkdown,
  serializeCard,
  generateCardFilename,
} from './markdownParser'

const KANBAN_DATA_DIR = './kanban-data'

export interface FileSystemAPI {
  readdir: (path: string) => Promise<string[]>
  readFile: (path: string, encoding: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  unlink: (path: string) => Promise<void>
  rename: (oldPath: string, newPath: string) => Promise<void>
  mkdir: (path: string, options?: { recursive: boolean }) => Promise<void>
}

// This will be injected by the Electron/Tauri layer or browser file system access
let fsAPI: FileSystemAPI | null = null

export function setFileSystemAPI(api: FileSystemAPI) {
  fsAPI = api
}

/**
 * Read all markdown files from a column directory
 * @param columnId - Column folder name (e.g., 'backlog', 'in-progress', 'done')
 * @returns Array of Card objects
 */
export async function readCardsFromColumn(columnId: string): Promise<Card[]> {
  if (!fsAPI) throw new Error('File system API not initialized')

  const columnPath = `${KANBAN_DATA_DIR}/${columnId}`
  const files = await fsAPI.readdir(columnPath)
  const markdownFiles = files.filter((f) => f.endsWith('.md'))

  const cards: Card[] = []
  for (const file of markdownFiles) {
    try {
      const filePath = `${columnPath}/${file}`
      const content = await fsAPI.readFile(filePath, 'utf-8')
      const card = parseMarkdown(content, filePath, columnId)
      cards.push(card)
    } catch (error) {
      console.error(`Error reading card ${file}:`, error)
    }
  }

  return cards
}

/**
 * Read all cards from all columns
 * @param columns - Array of column IDs
 * @returns Array of all Card objects
 */
export async function readAllCards(columns: string[]): Promise<Card[]> {
  const allCards: Card[] = []
  for (const columnId of columns) {
    const cards = await readCardsFromColumn(columnId)
    allCards.push(...cards)
  }
  return allCards
}

/**
 * Write a card to a markdown file
 * @param card - Card object to write
 */
export async function writeCard(card: Card): Promise<void> {
  if (!fsAPI) throw new Error('File system API not initialized')

  const content = serializeCard(card)
  await fsAPI.writeFile(card.filePath, content)
}

/**
 * Create a new card
 * @param title - Card title
 * @param columnId - Column to create the card in
 * @param content - Card content
 * @returns Created Card object
 */
export async function createCard(
  title: string,
  columnId: string,
  content = ''
): Promise<Card> {
  if (!fsAPI) throw new Error('File system API not initialized')

  const filename = generateCardFilename(title)
  const filePath = `${KANBAN_DATA_DIR}/${columnId}/${filename}`

  const card: Card = {
    id: filename.replace(/\.md$/, ''),
    title,
    content,
    column: columnId,
    filePath,
    metadata: {
      created: new Date(),
      updated: new Date(),
      tags: [],
    },
  }

  await writeCard(card)
  return card
}

/**
 * Update an existing card
 * @param card - Card object with updates
 */
export async function updateCard(card: Card): Promise<void> {
  if (!fsAPI) throw new Error('File system API not initialized')

  card.metadata.updated = new Date()
  await writeCard(card)
}

/**
 * Delete a card
 * @param card - Card to delete
 */
export async function deleteCard(card: Card): Promise<void> {
  if (!fsAPI) throw new Error('File system API not initialized')

  await fsAPI.unlink(card.filePath)
}

/**
 * Move a card to a different column
 * @param card - Card to move
 * @param targetColumn - Target column ID
 * @returns Updated Card object
 */
export async function moveCard(
  card: Card,
  targetColumn: string
): Promise<Card> {
  if (!fsAPI) throw new Error('File system API not initialized')

  const filename = card.filePath.split('/').pop()
  const newPath = `${KANBAN_DATA_DIR}/${targetColumn}/${filename}`

  await fsAPI.rename(card.filePath, newPath)

  return {
    ...card,
    column: targetColumn,
    filePath: newPath,
    metadata: {
      ...card.metadata,
      updated: new Date(),
    },
  }
}

/**
 * Ensure all column directories exist
 * @param columns - Array of column IDs
 */
export async function ensureColumnsExist(columns: string[]): Promise<void> {
  if (!fsAPI) throw new Error('File system API not initialized')

  for (const columnId of columns) {
    const path = `${KANBAN_DATA_DIR}/${columnId}`
    try {
      await fsAPI.mkdir(path, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }
}
