import { useEffect, useState, useRef } from 'react'
import { Card as CardType } from '../types'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCreateCard: () => void
  onEditCard: () => void
  onDeleteCard: () => void
  hasSelectedCard: boolean
  allCards: CardType[]
  onSelectCard: (cardId: string) => void
  onDeleteAnyCard: (cardId: string) => void
}

export const CommandPalette = ({
  isOpen,
  onClose,
  onCreateCard,
  onEditCard,
  onDeleteCard,
  hasSelectedCard,
  allCards,
  onSelectCard,
  onDeleteAnyCard,
}: CommandPaletteProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showingStoryList, setShowingStoryList] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [storySelectedIndex, setStorySelectedIndex] = useState(0)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const commands = [
    {
      label: 'Open card',
      action: () => setShowingStoryList(true),
      enabled: true,
    },
    { label: 'Delete card', action: () => setDeleteMode(true), enabled: true },
    { label: 'Create card', action: onCreateCard, enabled: true },
    {
      label: 'Edit selected card',
      action: onEditCard,
      enabled: hasSelectedCard,
    },
    {
      label: 'Delete selected card',
      action: onDeleteCard,
      enabled: hasSelectedCard,
    },
  ].filter(cmd => cmd.enabled)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (showingStoryList || deleteMode) {
        if (event.key === 'Escape') {
          setShowingStoryList(false)
          setDeleteMode(false)
          setStorySelectedIndex(0)
          return
        }

        if (event.key === 'ArrowDown' || event.key === 'j') {
          event.preventDefault()
          setStorySelectedIndex(prev => (prev + 1) % allCards.length)
        } else if (event.key === 'ArrowUp' || event.key === 'k') {
          event.preventDefault()
          setStorySelectedIndex(
            prev => (prev - 1 + allCards.length) % allCards.length
          )
        } else if (event.key === 'h') {
          // VIM: go back from card selection
          event.preventDefault()
          setShowingStoryList(false)
          setDeleteMode(false)
          setStorySelectedIndex(0)
        } else if (event.key === 'Enter') {
          event.preventDefault()
          if (deleteMode) {
            if (
              window.confirm(
                `Are you sure you want to delete "${allCards[storySelectedIndex].title}"?`
              )
            ) {
              onDeleteAnyCard(allCards[storySelectedIndex].id)
              onClose()
            }
          } else {
            onSelectCard(allCards[storySelectedIndex].id)
            onClose()
          }
        }
      } else {
        if (event.key === 'Escape') {
          onClose()
          return
        }

        if (event.key === 'ArrowDown' || event.key === 'j') {
          event.preventDefault()
          setSelectedIndex(prev => (prev + 1) % commands.length)
        } else if (event.key === 'ArrowUp' || event.key === 'k') {
          event.preventDefault()
          setSelectedIndex(
            prev => (prev - 1 + commands.length) % commands.length
          )
        } else if (event.key === 'Enter') {
          event.preventDefault()
          const command = commands[selectedIndex]
          if (
            command.label === 'Open card' ||
            command.label === 'Delete card'
          ) {
            command.action()
          } else {
            command.action()
            onClose()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    selectedIndex,
    commands,
    onClose,
    showingStoryList,
    deleteMode,
    storySelectedIndex,
    allCards,
    onSelectCard,
    onDeleteAnyCard,
  ])

  useEffect(() => {
    setSelectedIndex(0)
    setShowingStoryList(false)
    setDeleteMode(false)
    setStorySelectedIndex(0)
    itemRefs.current = []
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (
      (showingStoryList || deleteMode) &&
      itemRefs.current[storySelectedIndex]
    ) {
      itemRefs.current[storySelectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [storySelectedIndex, showingStoryList, deleteMode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {showingStoryList
              ? 'Select Card'
              : deleteMode
                ? 'Select Card to Delete'
                : 'Command Palette'}
          </div>
          {showingStoryList || deleteMode ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {allCards.map((card, index) => (
                  <button
                    key={card.id}
                    ref={el => (itemRefs.current[index] = el)}
                    onClick={() => {
                      if (deleteMode) {
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${card.title}"?`
                          )
                        ) {
                          onDeleteAnyCard(card.id)
                          onClose()
                        }
                      } else {
                        onSelectCard(card.id)
                        onClose()
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      index === storySelectedIndex
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{card.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {card.column.replace('-', ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {commands.map((command, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (
                      command.label === 'Open card' ||
                      command.label === 'Delete card'
                    ) {
                      command.action()
                    } else {
                      command.action()
                      onClose()
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {command.label}
                </button>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            {showingStoryList || deleteMode
              ? 'Use ↑↓/jk to navigate, Enter to select, Esc/h to go back'
              : 'Use ↑↓/jk to navigate, Enter to select, Esc to close'}
          </div>
        </div>
      </div>
    </div>
  )
}
