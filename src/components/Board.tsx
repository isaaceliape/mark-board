import { useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { Card as CardType } from '../types'
import { Column } from './Column'
import { Card } from './Card'
import { CardEditor } from './CardEditor'
import { useBoardStore } from '../stores/boardStore'
import { fsAPI } from '../utils/fileOperations'
import {
  initializeFileSystem,
  loadStoredFileSystem,
} from '../utils/fileSystemAccess'

export const Board = () => {
  const {
    columns,
    isLoading,
    error,
    filters,
    loadCards,
    addCard,
    updateCard,
    moveCard,
    deleteCard,
    setError,
  } = useBoardStore()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [fsInitialized, setFsInitialized] = useState(false)

  // Filter cards based on search and filter criteria
  const filterCards = (cards: CardType[]): CardType[] => {
    return cards.filter(card => {
      // Search filter (title and content)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const titleMatch = card.title.toLowerCase().includes(searchLower)
        const contentMatch = card.content.toLowerCase().includes(searchLower)
        if (!titleMatch && !contentMatch) {
          return false
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const cardTags = card.metadata.tags || []
        const hasMatchingTag = filters.tags.some(tag => cardTags.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }

      // Assignee filter
      if (filters.assignee) {
        if (card.metadata.assignee !== filters.assignee) {
          return false
        }
      }

      return true
    })
  }

  // Create filtered columns
  const filteredColumns = columns.map(column => ({
    ...column,
    cards: filterCards(column.cards),
  }))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    const load = async () => {
      if (!fsAPI) {
        const loaded = await loadStoredFileSystem()
        if (loaded) {
          setFsInitialized(true)
          loadCards()
        } else {
          setFsInitialized(false)
        }
      } else {
        setFsInitialized(true)
        loadCards()
      }
    }
    load()
  }, [loadCards])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = columns.flatMap(col => col.cards).find(c => c.id === active.id)
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const cardId = active.id as string
    let targetColumnId = over.id as string

    const targetColumn = columns.find(col => col.id === targetColumnId)
    if (!targetColumn) {
      const targetCard = columns
        .flatMap(col => col.cards)
        .find(c => c.id === targetColumnId)
      if (targetCard) {
        targetColumnId = targetCard.column
      }
    }

    moveCard(cardId, targetColumnId)
  }

  const handleAddCard = (
    columnId: string,
    data: {
      title: string
      content: string
      metadata: Partial<CardType['metadata']>
    }
  ) => {
    addCard(data.title, columnId, data.content, data.metadata)
  }

  const handleEditCard = (
    cardId: string,
    data: {
      title: string
      content: string
      metadata: Partial<CardType['metadata']>
    }
  ) => {
    const card = columns.flatMap(col => col.cards).find(c => c.id === cardId)
    if (!card) return

    updateCard(cardId, {
      title: data.title,
      content: data.content,
      metadata: {
        ...card.metadata,
        ...data.metadata,
        updated: new Date(),
      },
    })
    setEditingCard(null)
  }

  const handleOpenEditModal = (cardId: string) => {
    const card = columns.flatMap(col => col.cards).find(c => c.id === cardId)
    if (card) {
      setEditingCard(card)
    }
  }

  const handleSelectDirectory = async () => {
    try {
      await initializeFileSystem()
      setFsInitialized(true)
      loadCards()
    } catch (error) {
      setError('Failed to access file system. Please try again.')
    }
  }

  if (!fsInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
            Please select the kanban-data directory to get started.
          </p>
          <button
            onClick={handleSelectDirectory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Select Directory
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300">Loading board...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 h-screen overflow-x-auto bg-gray-100 dark:bg-gray-900">
        {filteredColumns.map(column => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            cards={column.cards}
            onAddCard={data => handleAddCard(column.id, data)}
            onEditCard={handleEditCard}
            onDeleteCard={deleteCard}
            onOpenEditModal={handleOpenEditModal}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <Card card={activeCard} onEdit={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>

      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <CardEditor
                card={editingCard}
                onSave={data => handleEditCard(editingCard.id, data)}
                onCancel={() => setEditingCard(null)}
              />
            </div>
          </div>
        </div>
      )}
    </DndContext>
  )
}
