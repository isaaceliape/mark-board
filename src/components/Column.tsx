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
  onOpenCreateModal: (columnId: string) => void
  onEditCard: (
    cardId: string,
    data: {
      title: string
      content: string
      metadata: Partial<CardType['metadata']>
    }
  ) => void
  onDeleteCard: (cardId: string) => void
  onOpenPreviewModal?: (cardId: string) => void
}

export const Column = React.memo(function Column({
  id,
  title,
  cards,
  selectedCardId,
  onOpenCreateModal,
  onEditCard,
  onDeleteCard,
  onOpenPreviewModal,
}: ColumnProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null)

  const { setNodeRef, isOver } = useDroppable({ id })

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
    <div className="flex flex-col h-full w-72 sm:w-80 bg-background-tertiary rounded-lg">
      <div className="px-4 py-3 border-b border-border-light bg-background-elevated rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <span className="bg-background-secondary text-text-secondary text-sm font-medium px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 px-4 py-3 space-y-3 overflow-y-auto bg-background-primary transition-colors ${
          isOver ? 'bg-primary-50' : ''
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
                onEdit={() => onOpenPreviewModal && onOpenPreviewModal(card.id)}
                onDelete={() => onDeleteCard(card.id)}
              />
            )
          )}
        </SortableContext>
      </div>

      <div className="px-4 py-3 border-t border-border-light bg-background-elevated rounded-b-lg">
        <button
          onClick={() => onOpenCreateModal(id)}
          className="w-full px-4 py-2 text-text-secondary bg-background-secondary hover:bg-interactive-hover rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          + New Card
        </button>
      </div>
    </div>
  )
})
