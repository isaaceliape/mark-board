import { useEffect, useState } from 'react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCreateCard: () => void
  onEditCard: () => void
  onDeleteCard: () => void
  hasSelectedCard: boolean
}

export const CommandPalette = ({
  isOpen,
  onClose,
  onCreateCard,
  onEditCard,
  onDeleteCard,
  hasSelectedCard,
}: CommandPaletteProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands = [
    { label: 'Create new card', action: onCreateCard, enabled: true },
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
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex(prev => (prev + 1) % commands.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        commands[selectedIndex].action()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, commands, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Command Palette
          </div>
          <div className="space-y-1">
            {commands.map((command, index) => (
              <button
                key={index}
                onClick={() => {
                  command.action()
                  onClose()
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
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      </div>
    </div>
  )
}
