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
    loadCards,
    addCard,
    updateCard,
    moveCard,
    deleteCard,
    setError,
  } = useBoardStore()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [fsInitialized, setFsInitialized] = useState(false)

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-4">
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading board...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
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
      <div className="flex gap-4 p-6 h-screen overflow-x-auto">
        {columns.map(column => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            cards={column.cards}
            onAddCard={data => handleAddCard(column.id, data)}
            onEditCard={handleEditCard}
            onDeleteCard={deleteCard}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <Card card={activeCard} onEdit={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
