import { useState, useEffect } from 'react'
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
            className="w-64 px-3 py-2 border border-border-medium rounded-md bg-background-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary"
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
              className="appearance-none bg-background-primary border border-border-medium rounded-md px-3 py-2 pr-8 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-32"
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
              className="appearance-none bg-background-primary border border-border-medium rounded-md px-3 py-2 pr-8 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-32"
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
          className="px-3 py-2 text-sm border border-border-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
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
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            >
              {tag}
              <span className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200">
                ×
              </span>
            </button>
          ))}
          {selectedAssignees.map(assignee => (
            <button
              key={`assignee-${assignee}`}
              onClick={() => handleRemoveAssignee(assignee)}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 hover:bg-success-200 dark:hover:bg-success-800 transition-colors"
            >
              {assignee}
              <span className="ml-2 text-success-600 dark:text-success-400 hover:text-success-800 dark:hover:text-success-200">
                ×
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
