import { useState, useEffect, useCallback } from 'react'
import { useBoardStore } from '../stores/boardStore'

export const SearchFilter = () => {
  const { columns, setFilters } = useBoardStore()
  const cards = columns.flatMap(col => col.cards)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  // Get unique tags and assignees from all cards
  const allTags = Array.from(
    new Set(cards.flatMap(card => card.metadata.tags || []))
  ).sort()

  const allAssignees = Array.from(
    new Set(
      cards
        .map(card => card.metadata.assignee)
        .filter((assignee): assignee is string => Boolean(assignee))
    )
  ).sort()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Update filters when any filter changes
  useEffect(() => {
    setFilters({
      search: debouncedSearch,
      tags: selectedTags,
      assignees: selectedAssignees,
    })
  }, [debouncedSearch, selectedTags, selectedAssignees, setFilters])

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  const handleAddAssignee = (assignee: string) => {
    if (assignee && !selectedAssignees.includes(assignee)) {
      setSelectedAssignees(prev => [...prev, assignee])
    }
  }

  const handleRemoveAssignee = (assignee: string) => {
    setSelectedAssignees(prev => prev.filter(a => a !== assignee))
  }

  const clearFilters = () => {
    setSearchInput('')
    setSelectedTags([])
    setSelectedAssignees([])
  }

  const hasActiveFilters =
    searchInput || selectedTags.length > 0 || selectedAssignees.length > 0

  return (
    <>
      {/* Filter Controls */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="relative">
            <select
              value=""
              onChange={e => handleAddTag(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
            >
              <option value="">Add tag filter</option>
              {allTags
                .filter(tag => !selectedTags.includes(tag))
                .map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Assignee Filter */}
        {allAssignees.length > 0 && (
          <div className="relative">
            <select
              value=""
              onChange={e => handleAddAssignee(e.target.value || '')}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
            >
              <option value="">Add assignee filter</option>
              {allAssignees
                .filter(assignee => !selectedAssignees.includes(assignee))
                .map(assignee => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Clear All Filters Button */}
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Clear All Filters
        </button>
      </div>

      {/* Selected Filters Display */}
      {(selectedTags.length > 0 || selectedAssignees.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map(tag => (
            <button
              key={`tag-${tag}`}
              onClick={() => handleRemoveTag(tag)}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {tag}
              <span className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                ×
              </span>
            </button>
          ))}
          {selectedAssignees.map(assignee => (
            <button
              key={`assignee-${assignee}`}
              onClick={() => handleRemoveAssignee(assignee)}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
              {assignee}
              <span className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
                ×
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
