import { useEffect, useCallback, useMemo } from 'react'
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
import { CardPreviewModal } from './CardPreviewModal'
import { CommandPalette } from './CommandPalette'
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
    selectedCardId,
    loadCards,
    addCard,
    updateCard,
    moveCard,
    deleteCard,
    setError,
    setSelectedCard,
  } = useBoardStore()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [previewingCard, setPreviewingCard] = useState<CardType | null>(null)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)
  const [creatingCard, setCreatingCard] = useState<{ columnId: string } | null>(
    null
  )
  const [fsInitialized, setFsInitialized] = useState(false)
  const [fsSupported, setFsSupported] = useState(true)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Filter cards based on search and filter criteria
  const filterCards = useCallback(
    (cards: CardType[]): CardType[] => {
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
          const hasMatchingTag = filters.tags.some(tag =>
            cardTags.includes(tag)
          )
          if (!hasMatchingTag) {
            return false
          }
        }

        // Assignees filter
        if (filters.assignees.length > 0) {
          if (
            !card.metadata.assignee ||
            !filters.assignees.includes(card.metadata.assignee)
          ) {
            return false
          }
        }

        return true
      })
    },
    [filters]
  )

  // Create filtered columns
  const filteredColumns = useMemo(
    () =>
      columns.map(column => ({
        ...column,
        cards: filterCards(column.cards),
      })),
    [columns, filterCards]
  )

  // Get all filtered card IDs in column order
  const allCardIds = useMemo(
    () => filteredColumns.flatMap(col => col.cards.map(card => card.id)),
    [filteredColumns]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    // Check if File System Access API is supported
    if (!(window as any).showDirectoryPicker) {
      setFsSupported(false)
      setFsInitialized(false)
      return
    }

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

  const handleOpenPreviewModal = useCallback(
    (cardId: string) => {
      const card = columns.flatMap(col => col.cards).find(c => c.id === cardId)
      if (card) {
        setPreviewingCard(card)
      }
    },
    [columns]
  )

  const handleOpenEditModal = useCallback(
    (cardId: string) => {
      const card = columns.flatMap(col => col.cards).find(c => c.id === cardId)
      if (card) {
        setEditingCard(card)
      }
    },
    [columns]
  )

  const handleOpenCreateModal = useCallback((columnId: string) => {
    setCreatingCard({ columnId })
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if editing or modal is open
      if (editingCard) {
        if (event.key === 'Escape') {
          setEditingCard(null)
        }
        return
      }

      if (previewingCard) {
        if (event.key === 'Escape') {
          setPreviewingCard(null)
        }
        return
      }

      switch (event.key) {
        case 'n':
          // Create new card in backlog
          event.preventDefault()
          addCard('New Card', 'backlog')
          break
        case 'e':
          // Edit selected card
          if (selectedCardId) {
            event.preventDefault()
            handleOpenEditModal(selectedCardId)
          }
          break
        case 'Delete':
          // Delete selected card
          if (selectedCardId) {
            event.preventDefault()
            if (window.confirm('Are you sure you want to delete this card?')) {
              deleteCard(selectedCardId)
            }
          }
          break
        case 'ArrowLeft':
          // Navigate to previous card
          if (selectedCardId) {
            event.preventDefault()
            const currentIndex = allCardIds.indexOf(selectedCardId)
            if (currentIndex > 0) {
              setSelectedCard(allCardIds[currentIndex - 1])
            }
          }
          break
        case 'ArrowRight':
          // Navigate to next card
          if (selectedCardId) {
            event.preventDefault()
            const currentIndex = allCardIds.indexOf(selectedCardId)
            if (currentIndex < allCardIds.length - 1) {
              setSelectedCard(allCardIds[currentIndex + 1])
            }
          }
          break
        case 'k':
          // Open command palette
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault()
            setIsCommandPaletteOpen(true)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    editingCard,
    previewingCard,
    selectedCardId,
    allCardIds,
    addCard,
    deleteCard,
    setSelectedCard,
    handleOpenEditModal,
  ])

  const handleSelectDirectory = async () => {
    try {
      await initializeFileSystem()
      setFsInitialized(true)
      loadCards()
    } catch (error) {
      console.error('File system initialization error:', error)
      if (error instanceof Error) {
        setError(
          `Failed to access file system: ${error.message}. Please ensure you select the kanban-data directory and it contains backlog, in-progress, and done subdirectories.`
        )
      } else {
        setError(
          'Failed to access file system. Please ensure you select the kanban-data directory.'
        )
      }
    }
  }

  if (!fsInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          {!fsSupported ? (
            <>
              <p className="text-lg text-red-600 dark:text-red-400 mb-4">
                Browser Not Supported
              </p>
              <p className="text-gray-700 dark:text-gray-200 mb-4">
                This app requires the File System Access API, which is only
                available in Chromium-based browsers like Chrome or Edge.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please open this app in Chrome, Edge, or another compatible
                browser.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
                Please select the kanban-data directory to get started.
              </p>
              <button
                onClick={handleSelectDirectory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select Directory
              </button>
            </>
          )}
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
      <div className="flex gap-4 p-6 h-screen overflow-x-auto bg-background-secondary transition-colors duration-300">
        {filteredColumns.map(column => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            cards={column.cards}
            selectedCardId={selectedCardId}
            onOpenCreateModal={handleOpenCreateModal}
            onEditCard={handleEditCard}
            onDeleteCard={deleteCard}
            onOpenPreviewModal={handleOpenPreviewModal}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <Card card={activeCard} onEdit={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>

      {previewingCard && (
        <CardPreviewModal
          card={previewingCard}
          onEdit={() => {
            setEditingCard(previewingCard)
            setPreviewingCard(null)
          }}
          onDelete={() => {
            if (window.confirm('Are you sure you want to delete this card?')) {
              deleteCard(previewingCard.id)
              setPreviewingCard(null)
            }
          }}
          onClose={() => setPreviewingCard(null)}
        />
      )}

      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

      {creatingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <CardEditor
                onSave={data => {
                  handleAddCard(creatingCard.columnId, data)
                  setCreatingCard(null)
                }}
                onCancel={() => setCreatingCard(null)}
              />
            </div>
          </div>
        </div>
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateCard={() => setCreatingCard({ columnId: 'backlog' })}
        onEditCard={() => {
          if (selectedCardId) {
            handleOpenEditModal(selectedCardId)
          }
        }}
        onDeleteCard={() => {
          if (selectedCardId) {
            if (window.confirm('Are you sure you want to delete this card?')) {
              deleteCard(selectedCardId)
            }
          }
        }}
        hasSelectedCard={!!selectedCardId}
        allCards={filteredColumns.flatMap(col => col.cards)}
        onSelectCard={handleOpenPreviewModal}
        onDeleteAnyCard={deleteCard}
      />
    </DndContext>
  )
}
