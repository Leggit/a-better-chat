# AI Coding Guidelines

## Overview
This document provides comprehensive coding guidelines specifically designed for AI agents working on this Next.js + Supabase project. These guidelines ensure code consistency, maintainability, and readability for both human developers and AI assistants.

## Table of Contents
1. [Project Structure](#project-structure)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React/Next.js Patterns](#reactnextjs-patterns)
4. [Supabase Integration](#supabase-integration)
5. [Styling Guidelines](#styling-guidelines)
6. [File Organization](#file-organization)
7. [Naming Conventions](#naming-conventions)
8. [Code Structure](#code-structure)
9. [Error Handling](#error-handling)
10. [Documentation](#documentation)
11. [Testing](#testing)
12. [Git Practices](#git-practices)

## Project Structure

### Directory Layout
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Route groups for auth pages
│   ├── (dashboard)/       # Route groups for dashboard
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── ui/               # Basic UI components (buttons, inputs, etc.)
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and configurations
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### File Naming
- Use kebab-case for file names: `user-profile.tsx`, `auth-provider.ts`
- Use PascalCase for component files: `UserProfile.tsx`, `AuthProvider.tsx`
- Use camelCase for utility/hook files: `useAuth.ts`, `formatDate.ts`

## TypeScript Guidelines

### Type Definitions
- Define interfaces for complex objects in `src/types/`
- Use descriptive names for types and interfaces
- Prefer interfaces over types for object shapes
- Use union types for multiple possible values

```typescript
// ✅ Good
interface User {
  id: string
  email: string
  profile: UserProfile
}

interface UserProfile {
  firstName: string
  lastName: string
  avatar?: string
}

// ❌ Avoid
type User = {
  id: string
  email: string
  profile: {
    firstName: string
    lastName: string
    avatar?: string
  }
}
```

### Type Safety
- Always use strict null checks (`strictNullChecks: true`)
- Use `unknown` instead of `any` when type is uncertain
- Avoid `any` type - prefer proper typing
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Generic Types
- Use meaningful generic names (T, U, V for simple generics)
- Prefer descriptive names for complex generics

```typescript
// ✅ Good
function createList<T extends BaseItem>(items: T[]): List<T>

// ❌ Avoid
function createList<T>(items: T[]): List<T>
```

## React/Next.js Patterns

### Component Structure
- Use functional components with hooks
- Prefer named exports over default exports
- Keep components focused on single responsibility
- Use descriptive component names

```typescript
// ✅ Good
export function UserAvatar({ user, size = 'medium' }: UserAvatarProps) {
  return (
    <div className={cn('avatar', `avatar-${size}`)}>
      <img src={user.avatar} alt={user.name} />
    </div>
  )
}

// ❌ Avoid
export default function Avatar(props) {
  // Component logic here
}
```

### Hooks Usage
- Create custom hooks for reusable logic
- Follow the Rules of Hooks strictly
- Name hooks with `use` prefix
- Keep hooks focused on single concern

```typescript
// ✅ Good
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser().then(setUser).finally(() => setLoading(false))
  }, [])

  return { user, loading, refetch: () => setUser(null) }
}

// ❌ Avoid
export function useDataAndAuth() {
  // Multiple concerns in one hook
}
```

### Server Components vs Client Components
- Use Server Components by default
- Add `'use client'` directive only when necessary
- Keep client components as small as possible
- Move business logic to server components when possible

## Supabase Integration

### Client Usage
- Import supabase client from `@/utils/supabase`
- Use the typed client for better IntelliSense
- Handle authentication state properly
- Use real-time subscriptions sparingly

```typescript
// ✅ Good
import { supabase } from '@/utils/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user }
}
```

### Database Types
- Keep database types updated with schema changes
- Use generated types when available
- Define custom types for complex queries

### Error Handling
- Handle Supabase errors appropriately
- Provide user-friendly error messages
- Use proper error boundaries for database operations

## Styling Guidelines

### Tailwind CSS
- Use Tailwind utility classes primarily
- Create custom classes for repeated patterns
- Use responsive prefixes consistently (`sm:`, `md:`, `lg:`, `xl:`)
- Follow mobile-first approach

```typescript
// ✅ Good
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6 md:p-8">
  {/* Content */}
</div>

// ❌ Avoid
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6 md:p-8 lg:flex-col lg:gap-8">
  {/* Complex responsive logic */}
</div>
```

### CSS Modules (if needed)
- Use CSS modules for complex component styles
- Name files with `.module.css` extension
- Import styles with descriptive names

## File Organization

### Component Organization
- Group related components in folders
- Use index.ts files for clean imports
- Separate concerns (UI logic, business logic, types)

```typescript
// components/auth/
├── index.ts
├── LoginForm.tsx
├── RegisterForm.tsx
├── AuthProvider.tsx
└── types.ts
```

### Utility Functions
- Group utilities by domain
- Use descriptive file names
- Export functions with clear names

```typescript
// utils/
├── auth.ts         // Authentication utilities
├── date.ts         // Date formatting functions
├── validation.ts   // Form validation helpers
└── api.ts          // API utilities
```

## Naming Conventions

### Components
- Use PascalCase: `UserProfile`, `DataTable`
- Be descriptive and specific
- Avoid generic names like `Card`, `Button` (use `UserCard`, `PrimaryButton`)

### Functions and Variables
- Use camelCase: `getUserData`, `formatDate`
- Be descriptive: `fetchUserById` not `getUser`
- Use prefixes for clarity: `isLoading`, `hasError`, `canEdit`

### Types and Interfaces
- Use PascalCase: `User`, `ApiResponse`
- Use descriptive names: `CreateUserRequest` not `UserReq`
- Use suffixes for clarity: `UserResponse`, `AuthError`

### Constants
- Use UPPER_SNAKE_CASE: `MAX_FILE_SIZE`, `API_BASE_URL`
- Group related constants in objects

## Code Structure

### Function Organization
- Keep functions under 50 lines when possible
- Extract complex logic into smaller functions
- Use early returns to reduce nesting

```typescript
// ✅ Good
export function processUserData(user: User) {
  if (!user) return null
  if (!user.isActive) return null

  const processedData = {
    id: user.id,
    displayName: formatUserName(user),
    avatar: getUserAvatar(user)
  }

  return processedData
}

// ❌ Avoid
export function processUserData(user: User) {
  let result = null
  if (user) {
    if (user.isActive) {
      result = {
        id: user.id,
        displayName: user.firstName + ' ' + user.lastName,
        avatar: user.avatar || '/default-avatar.png'
      }
    }
  }
  return result
}
```

### Import Organization
- Group imports by source (React, third-party, local)
- Use absolute imports with `@/` prefix
- Sort imports alphabetically within groups

```typescript
// ✅ Good
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/utils/date'
import type { User } from '@/types/user'

// ❌ Avoid
import {supabase} from '@/utils/supabase'
import {useState} from 'react'
import {Button} from '@/components/ui/Button'
import type {User} from '@/types/user'
import {formatDate} from '@/utils/date'
```

## Error Handling

### Try-Catch Patterns
- Use try-catch for async operations
- Provide meaningful error messages
- Handle different error types appropriately

```typescript
// ✅ Good
export async function createUser(userData: CreateUserData) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Failed to create user:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

### Error Boundaries
- Use React Error Boundaries for component errors
- Provide fallback UI for error states
- Log errors appropriately

## Documentation

### JSDoc Comments
- Add JSDoc for complex functions
- Document parameters and return types
- Explain complex logic with comments

```typescript
/**
 * Fetches user data with optional profile information
 * @param userId - The unique identifier of the user
 * @param includeProfile - Whether to include profile data (default: false)
 * @returns Promise resolving to user data or null if not found
 */
export async function getUser(userId: string, includeProfile = false) {
  // Implementation
}
```

### Component Documentation
- Document props with TypeScript interfaces
- Add comments for complex component logic
- Explain side effects and dependencies

### README Updates
- Update README.md when adding major features
- Document environment variables
- Provide setup and deployment instructions

## Testing

### Test File Organization
- Place tests next to implementation files
- Use `.test.ts` or `.test.tsx` extensions
- Group tests by feature

### Test Patterns
- Use descriptive test names
- Test happy path and error cases
- Mock external dependencies
- Test component behavior, not implementation details

```typescript
// ✅ Good
describe('useAuth', () => {
  it('returns user data when authenticated', async () => {
    // Test implementation
  })

  it('returns null when not authenticated', async () => {
    // Test implementation
  })
})
```

## Git Practices

### Commit Messages
- Use conventional commit format
- Write clear, descriptive messages
- Reference issue numbers when applicable

```
feat: add user authentication flow
fix: resolve login redirect issue #123
docs: update API documentation
refactor: simplify user data processing
```

### Branch Naming
- Use descriptive branch names
- Follow pattern: `feature/description`, `fix/description`, `refactor/description`

### Pull Requests
- Provide clear descriptions
- Reference related issues
- Request reviews from appropriate team members
- Ensure CI checks pass

---

## AI Agent Responsibilities

When working on this project, AI agents should:

1. **Read and understand these guidelines** before making changes
2. **Ask for clarification** when requirements are ambiguous
3. **Follow established patterns** from existing code
4. **Create comprehensive todos** for complex tasks
5. **Test changes thoroughly** before marking tasks complete
6. **Document decisions** and reasoning in comments when needed
7. **Use the provided tools** appropriately (search, edit, run commands)
8. **Communicate clearly** about what was done and why

## Code Review Checklist

Before submitting changes, verify:
- [ ] Code follows TypeScript best practices
- [ ] Components use proper React patterns
- [ ] Supabase integration follows established patterns
- [ ] Styling is consistent with Tailwind approach
- [ ] File organization matches project structure
- [ ] Naming conventions are followed
- [ ] Error handling is appropriate
- [ ] Code is well-documented
- [ ] Tests are included for new functionality
- [ ] No linting errors remain

This document should be updated as the project evolves and new patterns emerge.
