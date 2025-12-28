import { NextRequest, NextResponse } from 'next/server'
import { generateClarificationResponse } from '@/utils/openai'

export async function POST(request: NextRequest) {
  try {
    const { selectedText, userQuestion, conversationContext } = await request.json()

    if (!selectedText || !userQuestion) {
      return NextResponse.json(
        { error: 'Selected text and user question are required' },
        { status: 400 }
      )
    }

    const response = await generateClarificationResponse(
      selectedText,
      userQuestion,
      conversationContext
    )

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Clarification API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate clarification' },
      { status: 500 }
    )
  }
}
