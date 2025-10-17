import { useState, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import MDEditor from '@uiw/react-md-editor'
import toast, { Toaster } from 'react-hot-toast'
import { ChatInterface } from './ChatInterface'
import { AIMessage, AIProvider } from '../types/ai'
import { createCard } from '../utils/fileOperations'
import { aiService } from '../utils/aiService'

export function CoCreator() {
  const [editorContent, setEditorContent] = useState<string>('')
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('co-creator-messages')
    const savedContent = localStorage.getItem('co-creator-content')

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (error) {
        console.error('Failed to parse saved messages:', error)
      }
    }

    if (savedContent) {
      setEditorContent(savedContent)
    }
  }, [])

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('co-creator-messages', JSON.stringify(messages))
  }, [messages])

  // Save editor content to localStorage
  useEffect(() => {
    localStorage.setItem('co-creator-content', editorContent)
  }, [editorContent])

  const handleSendMessage = async (content: string, provider: AIProvider) => {
    setIsLoading(true)

    // Log provider for debugging (will be used when AI service is integrated)
    console.log('Using AI provider:', provider.name)

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])

    try {
      // Get AI response using the service
      const aiResponse = await aiService.sendMessage(
        [...messages, userMessage],
        provider
      )

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsertToEditor = (content: string) => {
    setEditorContent(prev => prev + '\n\n' + content)
    toast.success('Content inserted into editor')
  }

  const handleReplaceEditor = (content: string) => {
    setEditorContent(content)
    toast.success('Editor content replaced')
  }

  const handleResetConversation = () => {
    setMessages([])
    localStorage.removeItem('co-creator-messages')
    toast.success('Conversation reset')
  }

  const handleSaveTranscript = () => {
    const transcript = messages
      .map(
        msg =>
          `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`
      )
      .join('\n\n')

    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `co-creator-transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Transcript saved')
  }

  const handleExportToCard = async () => {
    if (!editorContent.trim()) {
      toast.error('Editor content is empty')
      return
    }

    try {
      const card = await createCard(
        'AI Generated User Story',
        'backlog',
        editorContent
      )
      // Update metadata after creation
      card.metadata.tags = ['ai-generated', 'user-story']

      toast.success('User story exported to backlog!')
      setEditorContent('')
    } catch (error) {
      console.error('Error exporting to card:', error)
      toast.error('Failed to export user story')
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <Toaster position="top-right" />
      <div className="flex-1">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                onInsertToEditor={handleInsertToEditor}
                onReplaceEditor={handleReplaceEditor}
                onResetConversation={handleResetConversation}
                onSaveTranscript={handleSaveTranscript}
                isLoading={isLoading}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />

          <Panel defaultSize={60} minSize={40}>
            <div className="h-full bg-white dark:bg-gray-800 p-4">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    User Story Editor
                  </h2>
                  <button
                    onClick={handleExportToCard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Export to Backlog
                  </button>
                </div>
                <div className="flex-1">
                  <MDEditor
                    value={editorContent}
                    onChange={value => setEditorContent(value || '')}
                    preview="live"
                    hideToolbar={false}
                    visibleDragbar={false}
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
