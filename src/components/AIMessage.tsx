'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { Markdown } from './Markdown'
import type { Message } from './ChatInterface'

interface AIMessageProps {
  message: Message
  onTextSelection: (messageId: string, selectedText: string) => void
}

export function AIMessage({ message, onTextSelection }: AIMessageProps) {
  const [selectedText, setSelectedText] = useState('')
  const [showClarifyButton, setShowClarifyButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const messageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const selectionRangeRef = useRef<Range | null>(null)
  const isClarifyingRef = useRef(false)

  // Memoize the markdown content to prevent re-rendering when only UI state changes
  // This preserves text selection even when button state updates
  const memoizedContent = useMemo(() => message.content, [message.content])

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Ignore clicks on the clarify button
      const target = e.target as HTMLElement
      if (target.closest('[data-clarify-button]') || isClarifyingRef.current) {
        return
      }

      // Defer to end of event loop so browser finalizes the selection range
      setTimeout(() => {
        const selection = window.getSelection()

        if (!selection || selection.rangeCount === 0) {
          setSelectedText('')
          setShowClarifyButton(false)
          selectionRangeRef.current = null
          return
        }

        const selected = selection.toString().trim()
        if (!selected || !messageRef.current) {
          setSelectedText('')
          setShowClarifyButton(false)
          return
        }

        const range = selection.getRangeAt(0)
        const startElement = range.startContainer.parentElement
        const endElement = range.endContainer.parentElement

        if (!startElement || !endElement) {
          setSelectedText('')
          setShowClarifyButton(false)
          return
        }

        // Check if selection is within this message
        const isInMessage =
          messageRef.current.contains(startElement) ||
          messageRef.current.contains(endElement) ||
          messageRef.current.contains(range.commonAncestorContainer as Node)

        if (!isInMessage) {
          setSelectedText('')
          setShowClarifyButton(false)
          return
        }

        // Valid selection within this message
        // Store the range so we can restore it if needed
        selectionRangeRef.current = range.cloneRange()
        setSelectedText(selected)
        setShowClarifyButton(true)

        try {
          const rect = range.getBoundingClientRect()
          const containerRect = messageRef.current?.getBoundingClientRect()
          const contentRect = contentRef.current?.getBoundingClientRect()
          
          if (!containerRect || !contentRect) {
            setShowClarifyButton(false)
            return
          }
          
          const marginOffset = 12 // Distance from the right edge of the content area

          // Calculate vertical center of selection relative to the message container
          // This will be the top position for the button (before translateY(-50%))
          const selectionCenterY = rect.top + rect.height / 2 - containerRect.top

          // Position button at the right border of the content area
          // Calculate left position relative to container: content right edge - container left + offset
          const contentRightEdgeRelativeToContainer = contentRect.right - containerRect.left
          const left = contentRightEdgeRelativeToContainer + marginOffset

          setButtonPosition({ top: selectionCenterY, left })
        } catch (error) {
          console.warn('Error calculating button position:', error)
          const rect = range.getBoundingClientRect()
          const containerRect = messageRef.current?.getBoundingClientRect()
          const contentRect = contentRef.current?.getBoundingClientRect()
          if (containerRect && contentRect) {
            const selectionCenterY = rect.top + rect.height / 2 - containerRect.top
            const contentRightEdgeRelativeToContainer = contentRect.right - containerRect.left
            setButtonPosition({
              top: selectionCenterY,
              left: contentRightEdgeRelativeToContainer + 12,
            })
          } else {
            setShowClarifyButton(false)
          }
        }
      }, 0)
    }

    // Listen on the whole document so mouseup outside the message still works
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])


  const handleClarify = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent click from bubbling to document
    e.preventDefault()
    
    if (selectedText) {
      isClarifyingRef.current = true
      
      // Store the selection range before any state updates
      const selection = window.getSelection()
      const rangeToRestore = selection && selection.rangeCount > 0 
        ? selection.getRangeAt(0).cloneRange() 
        : selectionRangeRef.current
      
      onTextSelection(message.id, selectedText)
      setShowClarifyButton(false)
      setSelectedText('')
      
      // Restore the selection after a brief delay to ensure state updates complete
      setTimeout(() => {
        if (rangeToRestore) {
          try {
            const sel = window.getSelection()
            if (sel) {
              sel.removeAllRanges()
              sel.addRange(rangeToRestore)
            }
          } catch (err) {
            // Selection restoration failed, ignore
            console.warn('Failed to restore selection:', err)
          }
        }
        isClarifyingRef.current = false
      }, 0)
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative overflow-visible" ref={messageRef}>
      {/* Message content */}
      <div ref={contentRef} className="py-6 px-4 select-text">
        <Markdown content={memoizedContent} className="text-base leading-relaxed" />
      </div>

      {/* Button positioned on the right border of the message container */}
      {showClarifyButton && selectedText && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
            transform: 'translateY(-50%)', // Center vertically with selection
          }}
        >
          <Button
            data-clarify-button
            onClick={handleClarify}
            size="sm"
            variant="outline"
            className="shadow-lg hover:shadow-xl transition-all duration-200 border-2 bg-background animate-in fade-in-0 slide-in-from-right-2 pointer-events-auto whitespace-nowrap"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            Clarify
          </Button>
        </div>
      )}
    </div>
  )
}
