
'use client'

import React from 'react'

export function parseTextContent(text: string): React.ReactNode[] {
  if (!text || typeof text !== 'string') {
    return [text || '']
  }
  
  const hashtagRegex = /#(\w+)/g
  const mentionRegex = /@(\w+)/g
  
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  
  // Combine both patterns
  const combinedRegex = /(#\w+|@\w+)/g
  const matches = Array.from(text.matchAll(combinedRegex))
  
  matches.forEach((match, index) => {
    const [fullMatch] = match
    const matchIndex = match.index!
    
    // Add text before the match
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex))
    }
    
    // Add the matched hashtag or mention as a styled element
    if (fullMatch.startsWith('#')) {
      parts.push(
        <span
          key={`tag-${index}`}
          className="text-primary hover:underline cursor-pointer font-semibold"
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = `/explore?tag=${fullMatch.slice(1)}`
          }}
        >
          {fullMatch}
        </span>
      )
    } else if (fullMatch.startsWith('@')) {
      parts.push(
        <span
          key={`mention-${index}`}
          className="text-secondary hover:underline cursor-pointer font-semibold"
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = `/profile/${fullMatch.slice(1)}`
          }}
        >
          {fullMatch}
        </span>
      )
    }
    
    lastIndex = matchIndex + fullMatch.length
  })
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  
  return parts.length > 0 ? parts : [text]
}

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const matches = text.match(hashtagRegex)
  return matches ? matches.map(tag => tag.slice(1)) : []
}

export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const matches = text.match(mentionRegex)
  return matches ? matches.map(mention => mention.slice(1)) : []
}
