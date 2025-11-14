import React from 'react'
import { Card as CardType } from '../types'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'

interface CardProps {
  card: CardType
  selected?: boolean
  onEdit: () => void
  onDelete: (cardId: string) => void
}

export const Card = React.memo(function Card({
  card,
  selected = false,
  onEdit,
  onDelete,
}: CardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const navigate = useNavigate()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showDeleteConfirm) {
      onDelete(card.id)
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const handleCoCreate = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Navigate to co-create page with card data as URL params
    const params = new URLSearchParams({
      cardId: card.id,
      title: card.title,
      content: card.content || '',
      tags: card.metadata.tags?.join(',') || '',
      assignee: card.metadata.assignee || '',
      dueDate: card.metadata.dueDate ? card.metadata.dueDate.toISOString() : '',
    })
    navigate(`/co-create?${params.toString()}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-background-elevated rounded-lg shadow-sm border-border-light border p-4 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer relative ${
        selected
          ? 'border-primary-500 ring-2 ring-primary-200'
          : 'border-border-light'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3
          className="font-medium text-text-primary flex-1 cursor-pointer"
          onClick={e => {
            e.stopPropagation()
            onEdit()
          }}
        >
          {card.title}
        </h3>
        <button
          onClick={handleDelete}
          className={`ml-2 px-2 py-1 rounded transition-all font-semibold ${
            showDeleteConfirm
              ? 'bg-status-error text-text-inverse hover:bg-red-700 shadow-lg scale-110 text-sm'
              : 'bg-status-error text-text-inverse hover:bg-red-600 text-xs shadow-md'
          }`}
          title={showDeleteConfirm ? 'Click again to confirm' : 'Delete card'}
          type="button"
        >
          {showDeleteConfirm ? 'Confirm?' : '×'}
        </button>
      </div>

      {card.content && (
        <p
          className="text-sm text-text-secondary mb-3 line-clamp-3 cursor-pointer"
          onClick={e => {
            e.stopPropagation()
            onEdit()
          }}
        >
          {card.content}
        </p>
      )}

      <div className="flex flex-wrap gap-2 items-center text-xs">
        {card.metadata.tags && card.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.metadata.tags.map(tag => (
              <span
                key={tag}
                className="bg-primary-100 text-primary-700 px-2 py-1 rounded transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {card.metadata.assignee && (
          <span className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded transition-colors duration-200">
            {card.metadata.assignee}
          </span>
        )}

        {card.metadata.dueDate && (
          <span className="bg-status-warning text-text-inverse px-2 py-1 rounded transition-colors duration-200">
            Due {formatDate(card.metadata.dueDate)}
          </span>
        )}
      </div>

      <button
        onClick={handleCoCreate}
        className="absolute bottom-2 right-2 text-text-muted hover:text-primary-500 p-1 rounded hover:bg-interactive-hover transition-colors duration-200"
        title="Edit with AI in Co-Creator"
        type="button"
      >
        🤖
      </button>
    </div>
  )
})
