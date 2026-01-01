'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Markdown } from './Markdown'
import type { Message } from './ChatInterface'

interface UserMessageProps {
  message: Message
}

export function UserMessage({ message }: UserMessageProps) {
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-end mb-6">
        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 max-w-2xl shadow-sm">
          <Markdown content={message.content} className="text-sm" />
        </div>
      </div>
    </div>
  )
}
