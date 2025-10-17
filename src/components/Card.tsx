import { Card as CardType } from '../types'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CardProps {
  card: CardType
  onEdit: () => void
  onDelete: (cardId: string) => void
}

export function Card({ card, onEdit, onDelete }: CardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3
          className="font-medium text-gray-900 dark:text-gray-100 flex-1 cursor-pointer"
          onClick={e => {
            e.stopPropagation()
            onEdit()
          }}
        >
          {card.title}
        </h3>
        <button
          onClick={handleDelete}
          className={`ml-2 text-xs px-2 py-1 rounded transition-colors ${
            showDeleteConfirm
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'text-gray-400 hover:text-red-500'
          }`}
          title={showDeleteConfirm ? 'Click again to confirm' : 'Delete card'}
          type="button"
        >
          {showDeleteConfirm ? 'Confirm?' : '×'}
        </button>
      </div>

      {card.content && (
        <p
          className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3 cursor-pointer"
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
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {card.metadata.assignee && (
          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
            {card.metadata.assignee}
          </span>
        )}

        {card.metadata.dueDate && (
          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
            Due {formatDate(card.metadata.dueDate)}
          </span>
        )}

        {card.metadata.assignee && (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
            {card.metadata.assignee}
          </span>
        )}

        {card.metadata.dueDate && (
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
            Due {formatDate(card.metadata.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}
