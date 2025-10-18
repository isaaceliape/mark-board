import { create } from 'zustand'
import { Card, Column } from '../types'
import {
  readAllCards,
  createCard as createCardFile,
  updateCard as updateCardFile,
  deleteCard as deleteCardFile,
  moveCard as moveCardFile,
} from '../utils/fileOperations'

export interface SearchFilters {
  search: string
  tags: string[]
  assignee: string
}

interface BoardState {
  columns: Column[]
  isLoading: boolean
  error: string | null
  filters: SearchFilters

  // Actions
  loadCards: () => Promise<void>
  addCard: (
    title: string,
    columnId: string,
    content?: string,
    metadata?: Partial<Card['metadata']>
  ) => Promise<void>
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>
  moveCard: (cardId: string, targetColumnId: string) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
  syncFromFileSystem: (cards: Card[]) => void
  setError: (error: string | null) => void
  setFilters: (filters: SearchFilters) => void
}

const COLUMN_IDS = ['backlog', 'in-progress', 'done']
const COLUMN_TITLES: Record<string, string> = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  done: 'Done',
}

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: COLUMN_IDS.map(id => ({
    id,
    title: COLUMN_TITLES[id],
    cards: [],
  })),
  isLoading: false,
  error: null,
  filters: {
    search: '',
    tags: [],
    assignee: '',
  },

  loadCards: async () => {
    set({ isLoading: true, error: null })
    try {
      const cards = await readAllCards(COLUMN_IDS)
      get().syncFromFileSystem(cards)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load cards'
      set({ error: message })
      console.error('Error loading cards:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addCard: async (
    title: string,
    columnId: string,
    content = '',
    metadata?: Partial<Card['metadata']>
  ) => {
    try {
      const newCard = await createCardFile(title, columnId, content)

      if (metadata) {
        newCard.metadata = { ...newCard.metadata, ...metadata }
      }

      set(state => ({
        columns: state.columns.map(col =>
          col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
        ),
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create card'
      set({ error: message })
      console.error('Error creating card:', error)
      throw error
    }
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    const { columns } = get()

    // Find the card
    let targetCard: Card | null = null
    for (const column of columns) {
      const card = column.cards.find(c => c.id === cardId)
      if (card) {
        targetCard = card
        break
      }
    }

    if (!targetCard) {
      set({ error: 'Card not found' })
      return
    }

    try {
      const updatedCard = { ...targetCard, ...updates }
      await updateCardFile(updatedCard)

      set(state => ({
        columns: state.columns.map(col => ({
          ...col,
          cards: col.cards.map(card =>
            card.id === cardId ? updatedCard : card
          ),
        })),
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update card'
      set({ error: message })
      console.error('Error updating card:', error)
      throw error
    }
  },

  moveCard: async (cardId: string, targetColumnId: string) => {
    const { columns } = get()

    let targetCard: Card | null = null
    let sourceColumnId: string | null = null

    for (const column of columns) {
      const card = column.cards.find(c => c.id === cardId)
      if (card) {
        targetCard = card
        sourceColumnId = column.id
        break
      }
    }

    if (!targetCard || !sourceColumnId) {
      set({ error: 'Card not found' })
      return
    }

    if (sourceColumnId === targetColumnId) {
      return
    }

    const originalCard = { ...targetCard }

    set(state => ({
      columns: state.columns.map(col => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            cards: col.cards.filter(c => c.id !== cardId),
          }
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            cards: [...col.cards, { ...targetCard, column: targetColumnId }],
          }
        }
        return col
      }),
    }))

    try {
      const updatedCard = await moveCardFile(originalCard, targetColumnId)

      set(state => ({
        columns: state.columns.map(col => {
          if (col.id === targetColumnId) {
            return {
              ...col,
              cards: col.cards.map(c => (c.id === cardId ? updatedCard : c)),
            }
          }
          return col
        }),
      }))
    } catch (error) {
      set(state => ({
        columns: state.columns.map(col => {
          if (col.id === targetColumnId) {
            return {
              ...col,
              cards: col.cards.filter(c => c.id !== cardId),
            }
          }
          if (col.id === sourceColumnId) {
            return {
              ...col,
              cards: [...col.cards, originalCard],
            }
          }
          return col
        }),
      }))

      const message =
        error instanceof Error ? error.message : 'Failed to move card'
      set({ error: message })
      console.error('Error moving card:', error)
      throw error
    }
  },

  deleteCard: async (cardId: string) => {
    const { columns } = get()

    // Find the card
    let targetCard: Card | null = null
    for (const column of columns) {
      const card = column.cards.find(c => c.id === cardId)
      if (card) {
        targetCard = card
        break
      }
    }

    if (!targetCard) {
      set({ error: 'Card not found' })
      return
    }

    try {
      await deleteCardFile(targetCard)

      set(state => ({
        columns: state.columns.map(col => ({
          ...col,
          cards: col.cards.filter(card => card.id !== cardId),
        })),
      }))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete card'
      set({ error: message })
      console.error('Error deleting card:', error)
      throw error
    }
  },

  syncFromFileSystem: (cards: Card[]) => {
    set(state => ({
      columns: state.columns.map(col => ({
        ...col,
        cards: cards.filter(card => card.column === col.id),
      })),
    }))
  },

  setError: (error: string | null) => {
    set({ error })
  },

  setFilters: (filters: SearchFilters) => {
    set({ filters })
  },
}))
