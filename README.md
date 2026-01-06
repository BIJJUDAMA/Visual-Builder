# Visual Builder

A fun, interactive way to build websites, created for the **Init Club** stall at **Anokha 2026**. Turning web design into a mini-game where anyone can jump in and design their own unique page in minutes.


## Features
###  Visual Drag & Drop Editor
- **Component Library**: Integrated components including Text blocks, Buttons, Images, Sections, Navbars, Footers, and Cards.
- **Free-form Positioning**: Position elements anywhere on the canvas or use structured flow layouts.
- **Direct Manipulation**: Resize, move, and edit elements directly on the canvas with intuitive handles.

###  Real-time Collaboration
- **Live Sync**: See changes made by other users instantly using Supabase Realtime.
- **Participant Presence**: View active users via the Participant Overlay.
- **Host Controls**: Manage session ownership and permissions.


###  Instant Sharing
- **One-Click Sharing**: Generate unique, shareable URLs for your session.
- **Mobile Preview**: Instant QR code generation to share link.
- **Responsive Output**: Built with mobile-first principles using Tailwind CSS.



## Environment Setup:
Copy this and put it as .env.local in your root directory
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```


## Database Schema:

This project uses Supabase (PostgreSQL) for data persistence and real-time features.

```sql
-- 1. CLEANUP
DROP TABLE IF EXISTS mutations CASCADE;
DROP TABLE IF EXISTS page_sessions CASCADE;

-- 2. SESSIONS TABLE
CREATE TABLE page_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT DEFAULT 'Untitled Project',
  layout JSONB DEFAULT '[]'::jsonb,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. MUTATIONS TABLE (Realtime Log)
CREATE TABLE mutations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID REFERENCES page_sessions(id) ON DELETE CASCADE,
  actor_id TEXT, 
  payload JSONB
);

-- 4. REALTIME SETUP
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- Add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE mutations;
ALTER PUBLICATION supabase_realtime ADD TABLE page_sessions; -- Also listen to session updates if needed

-- 5. RLS (Row Level Security)
ALTER TABLE page_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutations ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES

-- PAGE_SESSIONS

-- READ: Public (Collaborative)
CREATE POLICY "Public Read Sessions" 
ON page_sessions FOR SELECT 
USING (true);

-- CREATE: Authenticated (Host)
CREATE POLICY "Auth Create Sessions" 
ON page_sessions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

-- UPDATE: Public (Collaborative: Anyone in the session can save the snapshot)

-- Allowing active editors to save.
CREATE POLICY "Public Update Sessions" 
ON page_sessions FOR UPDATE 
USING (true);

-- DELETE: Owner Only
CREATE POLICY "Owner Delete Sessions" 
ON page_sessions FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- MUTATIONS

-- READ: Public
CREATE POLICY "Public Read Mutations" 
ON mutations FOR SELECT 
USING (true);

-- INSERT: Public (Collaborative)
CREATE POLICY "Public Insert Mutations" 
ON mutations FOR INSERT 
WITH CHECK (true);
```
###  Access & Authentication

**Note on User Accounts:**
This application is designed for event usage and does not support public signups.
- **Admins (Hosts)**: Must be manually added via the Supabase Dashboard. Only admins can log in to create and manage sessions.
- **Participants**: Can join and collaborate in any active session immediately without creating an account.