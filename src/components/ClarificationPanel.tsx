'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import { Markdown } from './Markdown'
import type { Clarification } from './ChatInterface'

interface ClarificationPanelProps {
  clarification: Clarification | null
  onClose: () => void
  onSubmit: (clarificationId: string, request: string) => void
}

export function ClarificationPanel({ clarification, onClose, onSubmit }: ClarificationPanelProps) {
  const [request, setRequest] = useState('')

  if (!clarification) {
    return null
  }

  const handleSubmit = () => {
    if (request.trim()) {
      onSubmit(clarification.id, request)
      setRequest('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-96 border-l bg-background flex flex-col">
      <Card className="flex-1 border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Clarify Selection</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Selected Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selected Text
            </label>
            <div className="bg-accent border border-border rounded-lg p-3">
              <p className="text-sm">"{clarification.selectedText}"</p>
            </div>
          </div>

          {/* Clarification Request */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              What would you like clarified?
            </label>
            <Textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a specific question about this text..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!request.trim() || clarification.status === 'pending'}
            className="w-full"
          >
            {clarification.status === 'pending' ? 'Getting clarification...' : 'Get Clarification'}
          </Button>

          {/* Response */}
          {clarification.response && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Clarification
              </label>
              <div className="bg-accent border border-border rounded-lg p-3">
                <Markdown content={clarification.response} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
