# FOMO App Setup Guide

## Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

### 2. Set Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Schema
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the SQL to create the tables

### 4. Test the Setup
1. Start your development server: `npm run dev`
2. Create a party and post
3. Check the Supabase dashboard to see the data
4. Test real-time updates by opening the app on multiple devices

## What We Fixed

### ✅ Multiple Supabase Client Issue
- Removed duplicate client creation in `party-service.ts`
- Now using single shared client from `lib/supabase.ts`

### ✅ Database Schema Issues
- Created proper database schema with all required columns
- Fixed column name mapping between database and TypeScript
- Added proper indexes and RLS policies

### ✅ Real-time Updates
- Fixed subscription setup for parties and posts
- Proper error handling for missing columns

## Testing Checklist

- [ ] Create a party on Device A
- [ ] Verify party appears on Device B
- [ ] Create a post on Device A
- [ ] Verify post appears in feed on Device B
- [ ] Check real-time updates work
- [ ] Verify data migration from localStorage works

## Troubleshooting

If you still see errors:
1. Check browser console for specific error messages
2. Verify environment variables are set correctly
3. Ensure database schema is properly created
4. Check Supabase dashboard for any connection issues 