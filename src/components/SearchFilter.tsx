import { useState, useEffect } from 'react'
import { useBoardStore } from '../stores/boardStore'

export const SearchFilter = () => {
  const { columns, setFilters } = useBoardStore()
  const cards = columns.flatMap(col => col.cards)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState('')

  // Get unique tags and assignees from all cards
  const allTags = Array.from(
    new Set(cards.flatMap(card => card.metadata.tags || []))
  ).sort()

  const allAssignees = Array.from(
    new Set(cards.map(card => card.metadata.assignee).filter(Boolean))
  ).sort()

  // Update filters when any filter changes
  useEffect(() => {
    setFilters({
      search,
      tags: selectedTags,
      assignee: selectedAssignee,
    })
  }, [search, selectedTags, selectedAssignee, setFilters])

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedTags([])
    setSelectedAssignee('')
  }

  const hasActiveFilters = search || selectedTags.length > 0 || selectedAssignee

  return (
    <>
      {/* Filter Controls */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
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
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
            >
              <option value="">All assignees</option>
              {allAssignees.map(assignee => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleRemoveTag(tag)}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {tag}
              <span className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                ×
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
