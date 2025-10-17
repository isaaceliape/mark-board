import { useState, useRef, useEffect } from 'react'
import {
  AIMessage,
  AIProvider,
  PromptTemplate,
  DEFAULT_PROMPT_TEMPLATES,
} from '../types/ai'

interface ChatInterfaceProps {
  messages: AIMessage[]
  onSendMessage: (content: string, provider: AIProvider) => Promise<void>
  onInsertToEditor: (content: string) => void
  onReplaceEditor: (content: string) => void
  onResetConversation: () => void
  onSaveTranscript: () => void
  isLoading: boolean
}

export function ChatInterface({
  messages,
  onSendMessage,
  onInsertToEditor,
  onReplaceEditor,
  onResetConversation,
  onSaveTranscript,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const content = selectedTemplate
      ? selectedTemplate.template.replace('{user_input}', input)
      : input

    const provider: AIProvider = {
      name: import.meta.env.VITE_AI_API_KEY ? 'openai' : 'mock',
      apiKey: import.meta.env.VITE_AI_API_KEY,
    }

    await onSendMessage(content, provider)
    setInput('')
    setSelectedTemplate(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInsertMessage = (message: AIMessage) => {
    onInsertToEditor(message.content)
  }

  const handleReplaceWithMessage = (message: AIMessage) => {
    onReplaceEditor(message.content)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Co-Creator
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={onSaveTranscript}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Save conversation transcript"
            >
              💾 Save
            </button>
            <button
              onClick={onResetConversation}
              className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
              title="Reset conversation"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-lg mb-2">Welcome to AI Co-Creator!</p>
            <p className="text-sm">
              Start a conversation to generate user stories and acceptance
              criteria.
            </p>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
              {message.role === 'assistant' && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleInsertMessage(message)}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    title="Insert into editor"
                  >
                    ➕ Insert
                  </button>
                  <button
                    onClick={() => handleReplaceWithMessage(message)}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    title="Replace editor content"
                  >
                    🔄 Replace
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Templates */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Prompt Templates
          </label>
          <select
            value={selectedTemplate?.id || ''}
            onChange={e => {
              const template = DEFAULT_PROMPT_TEMPLATES.find(
                t => t.id === e.target.value
              )
              setSelectedTemplate(template || null)
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select a template...</option>
            {DEFAULT_PROMPT_TEMPLATES.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedTemplate
                ? 'Describe your requirement...'
                : 'Type your message...'
            }
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}
