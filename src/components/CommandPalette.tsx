import { useEffect, useState, useRef } from 'react'
import { Card as CardType } from '../types'
import { useTheme } from '../hooks/useTheme'

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
  const [searchTerm, setSearchTerm] = useState('')
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { theme, toggle: toggleTheme } = useTheme()

  // Filter cards based on search term
  const filteredCards = allCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const commands = [
    {
      label: 'Open card',
      action: () => setShowingStoryList(true),
      enabled: true,
      keywords: ['open', 'card', 'view'],
    },
    {
      label: 'Delete card',
      action: () => setDeleteMode(true),
      enabled: true,
      keywords: ['delete', 'card', 'remove'],
    },
    {
      label: 'Create card',
      action: onCreateCard,
      enabled: true,
      keywords: ['create', 'card', 'new'],
    },
    {
      label: 'Edit selected card',
      action: onEditCard,
      enabled: hasSelectedCard,
      keywords: ['edit', 'selected', 'card'],
    },
    {
      label: 'Delete selected card',
      action: onDeleteCard,
      enabled: hasSelectedCard,
      keywords: ['delete', 'selected', 'card'],
    },
    {
      label: 'Toggle Dark/Light theme',
      action: () => {
        toggleTheme()
        onClose()
      },
      enabled: true,
      keywords: ['toggle', 'dark', 'theme', 'light'],
    },
  ].filter(cmd => cmd.enabled)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow Enter and Escape keys to work even when search input is focused
      const isSearchInputFocused =
        searchInputRef.current &&
        document.activeElement === searchInputRef.current
      if (
        isSearchInputFocused &&
        event.key !== 'Enter' &&
        event.key !== 'Escape'
      ) {
        return
      }

      if (showingStoryList || deleteMode) {
        if (event.key === 'Escape') {
          setShowingStoryList(false)
          setDeleteMode(false)
          setStorySelectedIndex(0)
          return
        }

        if (event.key === 'Tab' && event.shiftKey) {
          event.preventDefault()
          setStorySelectedIndex(
            prev => (prev - 1 + filteredCards.length) % filteredCards.length
          )
        } else if (
          event.key === 'ArrowDown' ||
          event.key === 'j' ||
          event.key === 'Tab'
        ) {
          event.preventDefault()
          setStorySelectedIndex(prev => (prev + 1) % filteredCards.length)
        } else if (event.key === 'ArrowUp' || event.key === 'k') {
          event.preventDefault()
          setStorySelectedIndex(
            prev => (prev - 1 + filteredCards.length) % filteredCards.length
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
            const cardToDelete =
              filteredCards.length === 1
                ? filteredCards[0]
                : filteredCards[storySelectedIndex]
            if (
              window.confirm(
                `Are you sure you want to delete "${cardToDelete.title}"?`
              )
            ) {
              onDeleteAnyCard(cardToDelete.id)
              onClose()
            }
          } else {
            const cardToOpen =
              filteredCards.length === 1
                ? filteredCards[0]
                : filteredCards[storySelectedIndex]
            onSelectCard(cardToOpen.id)
            onClose()
          }
        }
      } else {
        if (event.key === 'Escape') {
          onClose()
          return
        }

        if (event.key === 'Tab' && event.shiftKey) {
          event.preventDefault()
          setSelectedIndex(
            prev => (prev - 1 + commands.length) % commands.length
          )
        } else if (
          event.key === 'ArrowDown' ||
          event.key === 'j' ||
          event.key === 'Tab'
        ) {
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
    filteredCards,
    onSelectCard,
    onDeleteAnyCard,
  ])

  useEffect(() => {
    setSelectedIndex(0)
    setShowingStoryList(false)
    setDeleteMode(false)
    setStorySelectedIndex(0)
    setSearchTerm('')
    itemRefs.current = []
  }, [isOpen])

  // Focus search input when entering card selection mode
  useEffect(() => {
    if ((showingStoryList || deleteMode) && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showingStoryList, deleteMode])

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
            <>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setStorySelectedIndex(0) // Reset selection when searching
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  {filteredCards.map((card, index) => (
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
            </>
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
              ? 'Use ↑↓/jk/Tab to navigate, Enter to select, Esc/h to go back'
              : 'Use ↑↓/jk/Tab to navigate, Enter to select, Esc to close'}
          </div>
        </div>
      </div>
    </div>
  )
}
