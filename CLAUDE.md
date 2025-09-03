# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- Uses **pnpm** as the package manager
- Install dependencies: `pnpm install`
- Start development server: `pnpm dev`
- Build production: `pnpm build`
- Start production: `pnpm start`
- Lint code: `pnpm lint`

### Development Server
The development server runs on `http://localhost:3000`

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time subscriptions)
- **State Management**: React Context + Zustand for complex state
- **Package Manager**: pnpm

### Key Architecture Patterns

#### Data Flow
- **Supabase Integration**: Primary data source with localStorage fallback for development
- **Mock Client**: When Supabase env vars are missing, a mock client provides graceful degradation
- **Real-time Updates**: Supabase subscriptions for live party and post updates
- **Data Migration**: Automatic migration from localStorage to Supabase when available

#### Context Providers (Nested in app/layout.tsx)
1. **ThemeProvider**: Dark/light theme management
2. **AuthProvider**: User authentication and profile management
3. **PartyProvider**: Party state and real-time updates
4. **FriendProvider**: Friend relationships and status
5. **DraftProvider**: Draft party management

#### Authentication System
- Supabase Auth with user metadata storage
- User profiles stored in localStorage AND Supabase user metadata
- Graceful fallback when Supabase is unavailable
- User data sync between localStorage and Supabase

## Project Structure

### Core Directories
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `components/ui/` - Radix UI-based design system components
- `context/` - React Context providers for global state
- `lib/` - Utility functions and service layers
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions

### Key Files
- `lib/supabase.ts` - Supabase client with mock fallback
- `lib/party-service.ts` - Party and post management service
- `context/auth-context.tsx` - Authentication and user management
- `database-schema.sql` - Complete Supabase database schema

### Data Services
- **party-service.ts**: Handles party CRUD operations, real-time subscriptions, and localStorage migration
- **cached-api.ts**: Caching layer for API calls
- **user-service.ts**: User profile operations

## Development Setup

### Environment Configuration
Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: App runs without these using mock data for development.

### Database Setup
1. Create Supabase project
2. Run `database-schema.sql` in Supabase SQL Editor
3. Verify tables: `parties`, `posts` with proper RLS policies

## Key Development Notes

### Data Storage Strategy
- **Primary**: Supabase database for production data
- **Fallback**: localStorage for offline/development mode
- **Migration**: Automatic migration from localStorage to Supabase
- **Sync**: User profiles sync between localStorage and Supabase metadata

### Time Format Standardization
- All time inputs use `HH:MM` format (not `HH:MM:SS`)
- Party start times display as `HH:MM` consistently

### Privacy Controls
- User age is NOT displayed publicly (removed from profile views)
- Star signs display once per profile (above bio only)

### Real-time Features
- Party status updates (live/upcoming/completed)
- Post creation and updates
- User authentication state changes

### Component Patterns
- UI components in `components/ui/` follow Radix UI patterns
- Business logic components in `components/` use context providers
- Form validation using react-hook-form + zod

### State Management
- **Local state**: useState/useReducer for component state
- **Global state**: Context providers for cross-component state
- **Server state**: Direct Supabase queries with real-time subscriptions
- **Cache state**: Custom caching layer in `lib/cached-api.ts`

## Testing and Quality Assurance

### Before Committing
Always run these commands to ensure code quality:
- `pnpm lint` - ESLint validation
- `pnpm build` - Production build validation

### Debugging Tools
Development includes debug functions accessible via browser console:
- `debugUserData()` - Check user authentication state
- `debugSetUserData()` - Manually set user profile data
- Various auth and sync debugging functions

## Performance Considerations

### Media Handling
- Image compression using `lib/media-compression.ts`
- FFmpeg integration for video processing
- Optimized media picker with compression

### Caching Strategy
- User data cached in localStorage
- API responses cached using custom cache layer
- Memory cache for frequently accessed data

### Real-time Optimization
- Selective subscription to only relevant party/post updates
- Efficient re-rendering using React context optimization