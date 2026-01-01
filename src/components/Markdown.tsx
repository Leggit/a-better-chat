'use client'

import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  content: string
  className?: string
}

export const Markdown = memo(function Markdown({ content, className }: MarkdownProps) {
  // Pre-process content to prevent numbered items from being parsed as ordered lists
  const processedContent = content.replace(/^(\d+)\)/gm, '**$1)**')

  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert select-text", className)}>
      <ReactMarkdown
        components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="rounded-md text-sm"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className={cn(
                "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
                className
              )}
              {...props}
            >
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-4 last:mb-0">{children}</p>
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>
        },
        ul({ children }) {
          return <ul className="list-disc list-outside mb-4 ml-4 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-outside mb-4 ml-4 space-y-1">{children}</ol>
        },
        li({ children }) {
          return <li className="leading-normal">{children}</li>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground mb-4">
              {children}
            </blockquote>
          )
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>
        },
        em({ children }) {
          return <em className="italic">{children}</em>
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          )
        }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
})
