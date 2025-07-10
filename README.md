# FOMO App

A social party planning and management application built with Next.js, React, and Supabase.

## Recent Fixes ✅

### 1. **Party Start Time Format**
- **Fixed**: Party start times were displaying as `hh:mm:ss` format
- **Solution**: Updated all time displays to show only `hh:mm` format
- **Files**: Updated time formatting across all party display components

### 2. **User Profile Display Issues**
- **Fixed**: Star sign was showing twice on user profiles (above and below bio)
- **Solution**: Removed duplicate star sign display, kept only the one above bio
- **Fixed**: User age was being displayed publicly (privacy concern)
- **Solution**: Completely removed age display from user profiles

### 3. **Development Environment**
- **Fixed**: Missing dependencies causing build failures
- **Solution**: Installed all required dependencies with `pnpm install`
- **Fixed**: Supabase environment variables missing
- **Solution**: Added graceful fallback to mock client for development

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment Variables (Optional)
For full functionality with Supabase, create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: The app will run without these variables using mock data for development.

### 3. Start Development Server
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Features

- **Party Management**: Create, edit, and manage parties
- **Real-time Updates**: Live updates across devices
- **User Profiles**: Customizable user profiles with privacy controls
- **Social Features**: Friend requests, party invites, and social interactions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Package Manager**: pnpm

## Development Notes

- The app uses localStorage for data persistence when Supabase is not configured
- All time inputs now prevent seconds from being entered
- User profiles prioritize privacy by not displaying age publicly
- Star signs are displayed only once per profile for cleaner UI

## Troubleshooting

If you encounter issues:
1. Ensure all dependencies are installed: `pnpm install`
2. Check that the development server is running: `pnpm dev`
3. For Supabase features, set up environment variables as described above
4. Check the browser console for any error messages 