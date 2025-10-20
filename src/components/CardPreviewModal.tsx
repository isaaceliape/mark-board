import { Card as CardType } from '../types'
import { MarkdownPreview } from './MarkdownPreview'

interface CardPreviewModalProps {
  card: CardType
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export function CardPreviewModal({
  card,
  onEdit,
  onDelete,
  onClose,
}: CardPreviewModalProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex-1 pr-4">
            {card.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold leading-none transition-colors"
            title="Close (Esc)"
            type="button"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>

        {/* Metadata */}
        {(card.metadata.tags?.length ||
          card.metadata.assignee ||
          card.metadata.dueDate) && (
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 items-center">
            {card.metadata.tags && card.metadata.tags.length > 0 && (
              <>
                {card.metadata.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </>
            )}

            {card.metadata.assignee && (
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs">
                {card.metadata.assignee}
              </span>
            )}

            {card.metadata.dueDate && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded text-xs">
                Due {formatDate(card.metadata.dueDate)}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {card.content ? (
            <MarkdownPreview content={card.content} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No content available
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>Created: {formatDate(card.metadata.created)}</span>
            <span className="mx-2">|</span>
            <span>Updated: {formatDate(card.metadata.updated)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              type="button"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
