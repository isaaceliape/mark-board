import { useState, useEffect, useRef } from 'react'
import { Card, CardMetadata } from '../types'

interface CardEditorProps {
  card?: Card
  onSave: (data: {
    title: string
    content: string
    metadata: Partial<CardMetadata>
  }) => void
  onCancel: () => void
}

interface ValidationErrors {
  title?: string
  content?: string
  tags?: string
  assignee?: string
  dueDate?: string
}

export const CardEditor = ({ card, onSave, onCancel }: CardEditorProps) => {
  const [title, setTitle] = useState(card?.title || '')
  const [content, setContent] = useState(card?.content || '')
  const [tags, setTags] = useState(card?.metadata.tags?.join(', ') || '')
  const [assignee, setAssignee] = useState(card?.metadata.assignee || '')
  const [dueDate, setDueDate] = useState(
    card?.metadata.dueDate
      ? new Date(card.metadata.dueDate).toISOString().split('T')[0]
      : ''
  )
  const [errors, setErrors] = useState<ValidationErrors>({})
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        onCancel()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onCancel])

  const validateField = (
    field: keyof ValidationErrors,
    value: string
  ): string | undefined => {
    switch (field) {
      case 'title':
        if (!value.trim()) {
          return 'Title is required'
        }
        break
      case 'tags':
        const tagList = value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
        const uniqueTags = new Set(tagList)
        if (tagList.length !== uniqueTags.size) {
          return 'Tags must be unique'
        }
        break
      case 'assignee':
        if (value && !/^[a-zA-Z0-9._-]+$/.test(value.trim())) {
          return 'Assignee must contain only letters, numbers, dots, underscores, and hyphens'
        }
        break
      case 'dueDate':
        if (value) {
          const date = new Date(value)
          if (isNaN(date.getTime())) {
            return 'Invalid date format'
          }
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (date < today) {
            return 'Due date cannot be in the past'
          }
        }
        break
    }
    return undefined
  }

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {}

    newErrors.title = validateField('title', title)
    newErrors.tags = validateField('tags', tags)
    newErrors.assignee = validateField('assignee', assignee)
    newErrors.dueDate = validateField('dueDate', dueDate)

    // Remove undefined errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key as keyof ValidationErrors]) {
        delete newErrors[key as keyof ValidationErrors]
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFieldChange = (field: keyof ValidationErrors, value: string) => {
    const error = validateField(field, value)
    setErrors(prev => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[field] = error
      } else {
        delete newErrors[field]
      }
      return newErrors
    })

    // Update the field value
    switch (field) {
      case 'title':
        setTitle(value)
        break
      case 'tags':
        setTags(value)
        break
      case 'assignee':
        setAssignee(value)
        break
      case 'dueDate':
        setDueDate(value)
        break
    }
  }

  const handleSave = () => {
    if (!validateAll()) {
      return
    }

    const metadata: Partial<CardMetadata> = {
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
      assignee: assignee.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    }

    onSave({ title: title.trim(), content: content.trim(), metadata })
  }

  return (
    <div
      ref={editorRef}
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => handleFieldChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.title
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
          }`}
          placeholder="Card title"
          autoFocus
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Content (Markdown)
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          placeholder="Write your markdown content here..."
          rows={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={e => handleFieldChange('tags', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.tags
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
          }`}
          placeholder="tag1, tag2, tag3"
        />
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.tags}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Assignee
        </label>
        <input
          type="text"
          value={assignee}
          onChange={e => handleFieldChange('assignee', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.assignee
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
          }`}
          placeholder="Username"
        />
        {errors.assignee && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.assignee}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Due Date
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={e => handleFieldChange('dueDate', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            errors.dueDate
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
          }`}
        />
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.dueDate}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={Object.keys(errors).length > 0}
          className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
            Object.keys(errors).length > 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {card ? 'Save' : 'Create Card'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
