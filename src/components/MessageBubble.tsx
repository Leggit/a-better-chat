'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Message } from './ChatInterface'

interface MessageBubbleProps {
  message: Message
  onTextSelection: (messageId: string, selectedText: string) => void
}

export function MessageBubble({ message, onTextSelection }: MessageBubbleProps) {
  const [selectedText, setSelectedText] = useState('')
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout

    const handleSelection = () => {
      // Clear any existing timeout
      clearTimeout(selectionTimeout)

      // Delay processing to avoid rapid firing
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const selectedText = selection.toString().trim()

          // Show context menu if we have valid selected text in our message
          if (selectedText && isSelectionInMessage(selection)) {
            setSelectedText(selectedText)
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()

            // Position the menu above the selection
            setContextMenuPosition({
              x: rect.left + (rect.width / 2),
              y: rect.top - 40 // Position above the selection
            })
            setShowContextMenu(true)
          }
          // Don't hide the context menu here - only hide on click outside
        }
      }, 100)
    }

    const handleClick = (e: MouseEvent) => {
      // Don't hide if clicking on the context menu itself
      const contextMenu = document.querySelector('[data-context-menu]')
      if (contextMenu && contextMenu.contains(e.target as Node)) {
        return
      }

      // Hide if clicking outside both the message and context menu
      if (messageRef.current && !messageRef.current.contains(e.target as Node)) {
        setShowContextMenu(false)
        setSelectedText('')
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    document.addEventListener('click', handleClick)

    return () => {
      clearTimeout(selectionTimeout)
      document.removeEventListener('selectionchange', handleSelection)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  const isSelectionInMessage = (selection: Selection) => {
    if (!messageRef.current) return false

    // Check if the selection intersects with our message element
    const messageElement = messageRef.current
    const range = selection.getRangeAt(0)

    // Get all elements in the selection range
    const selectedElements = range.cloneContents().querySelectorAll('*')

    // Check if any part of the selection is within our message
    for (let i = 0; i < selectedElements.length; i++) {
      if (messageElement.contains(selectedElements[i])) {
        return true
      }
    }

    // Check if the selection start or end is within our message
    const startContainer = range.startContainer
    const endContainer = range.endContainer

    return messageElement.contains(startContainer) || messageElement.contains(endContainer)
  }

  const handleClarify = () => {
    if (selectedText) {
      onTextSelection(message.id, selectedText)
      setShowContextMenu(false)
      setSelectedText('')
      // Clear the selection
      window.getSelection()?.removeAllRanges()
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <Card
        ref={messageRef}
        className={`max-w-xs lg:max-w-md xl:max-w-lg select-text ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <CardContent className="p-3">
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          <div className={`text-xs mt-2 ${
            message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {formatTimestamp(message.timestamp)}
          </div>
        </CardContent>
      </Card>

      {/* Context Menu for Text Selection */}
      {showContextMenu && selectedText && (
        <div
          data-context-menu
          className="fixed z-[100] animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <Button
            onClick={handleClarify}
            size="sm"
            variant="default"
            className="shadow-lg border-2"
          >
            Clarify "{selectedText.length > 20 ? selectedText.substring(0, 20) + '...' : selectedText}"
          </Button>
        </div>
      )}
    </div>
  )
}
