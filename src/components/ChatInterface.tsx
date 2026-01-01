'use client'

import { useState, useRef, useEffect } from 'react'
import { AIMessage } from './AIMessage'
import { UserMessage } from './MessageBubble'
import { ClarificationPanel } from './ClarificationPanel'
import { ChatInput } from './ChatInput'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Clarification {
  id: string
  messageId: string
  selectedText: string
  request: string
  response?: string
  status: 'pending' | 'completed'
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m here to help. Try asking me about machine learning algorithms or any other topic. You can select text in my responses to get clarifications.',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [clarifications, setClarifications] = useState<Clarification[]>([])
  const [activeClarification, setActiveClarification] = useState<Clarification | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setInputValue('')
    setIsLoading(true)

    try {
      // Call the API route instead of direct OpenAI call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: currentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please check your OpenAI API key and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }


  const handleTextSelection = (messageId: string, selectedText: string) => {
    const clarification: Clarification = {
      id: Date.now().toString(),
      messageId,
      selectedText,
      request: '',
      status: 'pending'
    }
    setClarifications(prev => [...prev, clarification])
    setActiveClarification(clarification)
  }

  const handleClarificationSubmit = async (clarificationId: string, request: string) => {
    const clarification = clarifications.find(c => c.id === clarificationId)
    if (!clarification) return

    // Update status to processing
    setClarifications(prev =>
      prev.map(c =>
        c.id === clarificationId
          ? { ...c, status: 'pending' as const, request }
          : c
      )
    )

    try {
      // Get conversation context for better clarifications
      const conversationContext = messages
        .slice(-5) // Last 5 messages for context
        .map(m => `${m.role}: ${m.content}`)

      const response = await fetch('/api/clarify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedText: clarification.selectedText,
          userQuestion: request,
          conversationContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get clarification')
      }

      const data = await response.json()

      setClarifications(prev =>
        prev.map(c =>
          c.id === clarificationId
            ? {
                ...c,
                response: data.response,
                status: 'completed' as const
              }
            : c
        )
      )

      // Update active clarification if it's the one that was submitted
      setActiveClarification(prev =>
        prev?.id === clarificationId
          ? {
              ...clarification,
              response: data.response,
              status: 'completed' as const
            }
          : prev
      )
    } catch (error) {
      console.error('Failed to get clarification:', error)
      setClarifications(prev =>
        prev.map(c =>
          c.id === clarificationId
            ? {
                ...c,
                response: 'Sorry, I encountered an error while generating this clarification. Please try again.',
                status: 'completed' as const
              }
            : c
        )
      )
    }
  }

  const handleCloseClarification = () => {
    setActiveClarification(null)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="min-h-full">
            {messages.map((message) => (
              message.role === 'assistant' ? (
                <AIMessage
                  key={message.id}
                  message={message}
                  onTextSelection={handleTextSelection}
                />
              ) : (
                <UserMessage
                  key={message.id}
                  message={message}
                />
              )
            ))}
            {isLoading && (
              <div className="w-full max-w-4xl mx-auto py-6 px-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Clarification Panel */}
      <ClarificationPanel
        clarification={activeClarification}
        onClose={handleCloseClarification}
        onSubmit={handleClarificationSubmit}
      />
    </div>
  )
}
