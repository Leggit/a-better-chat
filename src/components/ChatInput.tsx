'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
}

export const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(
  ({ value, onChange, onSubmit, placeholder = "Type your message...", disabled = false, isLoading = false }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)
    const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null)

    // Sync the contentEditable div with the hidden textarea
    useEffect(() => {
      if (contentRef.current && contentRef.current.textContent !== value) {
        // Ensure only plain text is set
        const plainText = value.replace(/<[^>]*>/g, '')
        contentRef.current.textContent = plainText
      }
    }, [value])

    // Prevent formatting operations
    useEffect(() => {
      const handleBeforeInput = (e: InputEvent) => {
        // Prevent formatting operations
        if (e.inputType && (
          e.inputType.includes('format') ||
          e.inputType === 'insertHTML' ||
          e.inputType === 'insertLink'
        )) {
          e.preventDefault()
        }
      }

      const contentDiv = contentRef.current
      if (contentDiv) {
        contentDiv.addEventListener('beforeinput', handleBeforeInput as EventListener)
        return () => contentDiv.removeEventListener('beforeinput', handleBeforeInput as EventListener)
      }
    }, [])

    const handleInput = () => {
      if (contentRef.current) {
        const text = contentRef.current.textContent || ''
        const plainText = text.replace(/<[^>]*>/g, '')

        // Only update the DOM if we actually stripped HTML
        if (plainText !== text) {
          contentRef.current.textContent = plainText
        }

        onChange(plainText)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Prevent formatting shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase()
        if (['b', 'i', 'u', 'k'].includes(key)) {
          e.preventDefault()
          return
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (value.trim()) {
          onSubmit()
        }
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      // Get plain text from clipboard
      const plainText = e.clipboardData.getData('text/plain')
      // Insert plain text at cursor position
      document.execCommand('insertText', false, plainText)
    }

    const handleFocus = () => {
      setIsFocused(true)
    }

    const handleBlur = () => {
      setIsFocused(false)
    }

    const handleClick = () => {
      contentRef.current?.focus()
    }

    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative">
          {/* Hidden textarea for form handling and accessibility */}
          <textarea
            ref={hiddenTextareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
            aria-hidden="true"
          />

          {/* ContentEditable input area */}
          <div
            ref={(el) => {
              contentRef.current = el
              if (ref) {
                if (typeof ref === 'function') {
                  ref(el)
                } else {
                  ref.current = el
                }
              }
            }}
            contentEditable={!disabled}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleClick}
            className={`
              min-h-[44px] max-h-48 overflow-y-auto resize-none
              px-4 py-3 pr-16
              rounded-2xl border border-input bg-background
              text-sm text-foreground
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
              ${isFocused ? 'ring-2 ring-ring ring-offset-2' : ''}
              ${value === '' ? 'text-muted-foreground' : ''}
            `}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(148 163 184) transparent'
            }}
            data-placeholder={value === '' ? placeholder : undefined}
          />

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            disabled={!value.trim() || disabled || isLoading}
            size="sm"
            className="absolute bottom-2 right-3 h-8 w-8 p-0 rounded-full shadow-sm"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: transparent;
          }
          div::-webkit-scrollbar-thumb {
            background: rgb(148 163 184);
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: rgb(100 116 139);
          }

          /* Placeholder text */
          div[data-placeholder]:empty::before {
            content: attr(data-placeholder);
            color: rgb(148 163 184);
            pointer-events: none;
          }

          div[data-placeholder]:not(:empty)::before {
            content: none;
          }
        `}</style>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'
