import React from 'react'
import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card as CardType } from '../types'
import { Card } from './Card'
import { CardEditor } from './CardEditor'

interface ColumnProps {
  id: string
  title: string
  cards: CardType[]
  selectedCardId?: string | null
  onAddCard: (data: {
    title: string
    content: string
    metadata: Partial<CardType['metadata']>
  }) => void
  onEditCard: (
    cardId: string,
    data: {
      title: string
      content: string
      metadata: Partial<CardType['metadata']>
    }
  ) => void
  onDeleteCard: (cardId: string) => void
  onOpenEditModal?: (cardId: string) => void
}

export const Column = React.memo(function Column({
  id,
  title,
  cards,
  selectedCardId,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onOpenEditModal,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)

  const { setNodeRef, isOver } = useDroppable({ id })

  const handleAddCard = (data: {
    title: string
    content: string
    metadata: Partial<CardType['metadata']>
  }) => {
    onAddCard(data)
    setIsAdding(false)
  }

  const handleEditCard = (data: {
    title: string
    content: string
    metadata: Partial<CardType['metadata']>
  }) => {
    if (editingCardId) {
      onEditCard(editingCardId, data)
      setEditingCardId(null)
    }
  }

  const editingCard = cards.find(card => card.id === editingCardId)

  return (
    <div className="flex flex-col h-full w-80 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h2>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 px-4 py-3 space-y-3 overflow-y-auto dark:bg-gray-600 transition-colors ${
          isOver ? 'bg-blue-50 dark:bg-blue-900/30' : ''
        }`}
      >
        <SortableContext
          items={cards.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map(card =>
            editingCardId === card.id ? (
              <CardEditor
                key={card.id}
                card={editingCard}
                onSave={handleEditCard}
                onCancel={() => setEditingCardId(null)}
              />
            ) : (
              <Card
                key={card.id}
                card={card}
                selected={selectedCardId === card.id}
                onEdit={() => onOpenEditModal && onOpenEditModal(card.id)}
                onDelete={() => onDeleteCard(card.id)}
              />
            )
          )}
        </SortableContext>

        {isAdding && (
          <CardEditor
            onSave={handleAddCard}
            onCancel={() => setIsAdding(false)}
          />
        )}
      </div>

      <div className="px-4 py-3 border-t dark:bg-gray-700 border-gray-200 bg-white rounded-b-lg">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-700 dark:bg-gray-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + New Card
          </button>
        )}
      </div>
    </div>
  )
})
