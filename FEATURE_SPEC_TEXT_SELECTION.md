# Text Selection & Clarification Feature - Technical Specification

## 🎯 Feature Overview

Implement text selection within AI response messages to request clarifications/expansions that appear in a side panel (desktop) or overlay modal (mobile), similar to Word document comments.

## 📋 Requirements

### Core Functionality
- **Text Selection**: Users can select text within AI response messages
- **Context Menu**: Right-click or long-press on selected text shows "Clarify" option
- **Side Panel**: Desktop - collapsible side panel showing clarification
- **Modal Overlay**: Mobile - closable overlay window on top of chat
- **Context Preservation**: Selected text becomes the context for AI clarification
- **Persistent Storage**: Clarifications are saved and can be revisited

### User Experience
- **Visual Feedback**: Selected text is highlighted
- **Smooth Transitions**: Panel/modal appears with animation
- **Responsive Design**: Adapts to screen size (desktop vs mobile)
- **Easy Dismissal**: Click outside or close button to dismiss
- **Multiple Clarifications**: Support multiple clarifications per message

## 🏗️ Technical Architecture

### Database Schema

```sql
-- Core tables for MVP
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- New tables for clarifications
CREATE TABLE message_clarifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  selected_text TEXT NOT NULL,
  selected_range JSONB NOT NULL, -- Store start/end positions for text highlighting
  clarification_request TEXT NOT NULL,
  clarification_response TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Future: For imported conversations
CREATE TABLE imported_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  provider TEXT NOT NULL, -- 'chatgpt', 'claude', 'openai', etc.
  external_id TEXT, -- ID from the external provider
  title TEXT,
  messages JSONB, -- Store original conversation data
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### TypeScript Types

```typescript
// Existing types (enhanced)
interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  clarifications?: Clarification[]
}

// New types
interface Clarification {
  id: string
  message_id: string
  selected_text: string
  selected_range: TextRange
  clarification_request: string
  clarification_response?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  created_at: string
  updated_at: string
}

interface TextRange {
  startOffset: number
  endOffset: number
  startContainer?: string // For complex DOM structures
  endContainer?: string
}

interface ClarificationPanelProps {
  clarification: Clarification
  isOpen: boolean
  onClose: () => void
  onUpdate: (clarification: Clarification) => void
}
```

## 🎨 UI/UX Design

### Desktop Layout
```
┌─────────────────────────────────┬─────────────────┐
│                                 │                 │
│        Chat Messages            │  Clarification  │
│                                 │     Panel       │
│  ┌─────────────────────────┐    │                 │
│  │ AI Response Message     │    │  [Selected     │
│  │ with [highlighted] text │    │   text]        │
│  │                         │    │                 │
│  │ [Clarify] button        │    │  Clarification │
│  └─────────────────────────┘    │  content...    │
│                                 │                 │
│                                 │  [×] Close      │
└─────────────────────────────────┴─────────────────┘
```

### Mobile Layout
```
┌─────────────────────────────────┐
│                                 │
│        Chat Messages            │
│                                 │
│  ┌─────────────────────────┐    │
│  │ AI Response Message     │    │
│  │ with [highlighted] text │    │
│  │                         │    │
│  │ [Clarify] button        │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
     ▲                           ▲
     │                           │
     └─ Modal Overlay Appears ──┘

┌─────────────────────────────────┐
│ [×]                      [Send] │
│                                 │
│ Selected text:                  │
│ "machine learning algorithms"   │
│                                 │
│ Your clarification request:     │
│ ________________________________│
│ ________________________________│
│ ________________________________│
│                                 │
│ [AI is thinking...]             │
│                                 │
└─────────────────────────────────┘
```

## 🔧 Implementation Details

### Text Selection Handling

```typescript
// Hook for text selection
function useTextSelection() {
  const [selection, setSelection] = useState<TextSelection | null>(null)

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        const selectedText = sel.toString().trim()

        if (selectedText && isWithinMessage(range)) {
          setSelection({
            text: selectedText,
            range: {
              startOffset: range.startOffset,
              endOffset: range.endOffset,
              startContainer: getNodePath(range.startContainer),
              endContainer: getNodePath(range.endContainer)
            },
            messageId: getMessageIdFromRange(range)
          })
        }
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [])

  return selection
}
```

### Clarification Panel Component

```typescript
function ClarificationPanel({ clarification, isOpen, onClose }: ClarificationPanelProps) {
  const [request, setRequest] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Call AI API with context
      const aiResponse = await clarifyWithAI(clarification.selected_text, request)
      setResponse(aiResponse)

      // Save to database
      await saveClarification({
        ...clarification,
        clarification_request: request,
        clarification_response: aiResponse,
        status: 'completed'
      })
    } catch (error) {
      console.error('Clarification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg"
    >
      <div className="p-4">
        <button onClick={onClose} className="float-right">×</button>
        <h3 className="font-semibold mb-2">Clarify Selection</h3>

        <div className="bg-gray-100 p-2 rounded mb-4">
          <strong>Selected text:</strong> {clarification.selected_text}
        </div>

        <textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="What would you like clarified about this?"
          className="w-full p-2 border rounded mb-4"
          rows={3}
        />

        <button
          onClick={handleSubmit}
          disabled={!request.trim() || isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Getting clarification...' : 'Clarify'}
        </button>

        {response && (
          <div className="mt-4 p-3 bg-green-50 rounded">
            <strong>Clarification:</strong>
            <p className="mt-2">{response}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
```

### Mobile Modal Component

```typescript
function ClarificationModal({ clarification, isOpen, onClose }: ClarificationModalProps) {
  // Similar to panel but as a modal overlay
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white w-full max-h-96 rounded-t-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content similar to panel */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## 🔄 API Integration

### Clarification Request Flow

```typescript
async function clarifyWithAI(selectedText: string, userRequest: string): Promise<string> {
  const prompt = `
    The user has selected this text from a previous AI response: "${selectedText}"

    Their clarification request: "${userRequest}"

    Please provide a clear, helpful clarification that addresses their specific question
    while maintaining context from the selected text.
  `

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an AI assistant providing clarifications on specific parts of previous responses. Be concise but thorough.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  return response.choices[0].message.content
}
```

## 📱 Responsive Behavior

### Breakpoint Strategy
- **Desktop (> 768px)**: Side panel with persistent visibility
- **Tablet (768px - 1024px)**: Collapsible side panel or modal
- **Mobile (< 768px)**: Modal overlay from bottom

### Touch Interactions
- **Long press** to select text on mobile
- **Swipe down** to dismiss mobile modal
- **Tap outside** to close overlays

## 🧪 Testing Strategy

### Unit Tests
- Text selection logic
- Component rendering
- State management

### Integration Tests
- Full clarification flow
- Database operations
- API calls

### E2E Tests
- Complete user journey
- Mobile responsiveness
- Error handling

## 🚀 Future Extensibility

### Import Functionality
The database schema already supports imported conversations:

```typescript
interface ImportedConversation {
  id: string
  provider: 'chatgpt' | 'claude' | 'openai'
  external_id: string
  title: string
  messages: ImportedMessage[]
  imported_at: string
}

interface ImportedMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
```

### Advanced Features
- Multiple clarifications per message
- Clarification threads (clarify the clarification)
- Collaborative clarifications
- AI-suggested clarification points

## 🎯 Success Criteria

- Users can select text and get clarifications without disrupting chat flow
- Clarifications appear in appropriate UI (side panel/modal)
- All clarifications are persisted and retrievable
- Smooth responsive behavior across devices
- Clear visual feedback for all interactions
