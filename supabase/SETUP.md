# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Create a new project
4. Wait for the project to be provisioned

## 2. Get Your API Keys

1. In your Supabase dashboard, go to Project Settings > API
2. Copy these values to your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your public anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep this secret!)

## 3. Run Migrations

You have two options to run the migrations:

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard > SQL Editor
2. Open each migration file in order:
   - `00001_initial_schema.sql`
   - `00002_row_level_security.sql`
   - `00003_seed_data.sql`
3. Copy and paste the content into the SQL Editor
4. Click "Run" for each migration

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Push migrations:
   ```bash
   supabase db push
   ```

## 4. Enable pgvector

The first migration automatically enables the pgvector extension. Verify it's enabled:

1. Go to Database > Extensions in Supabase dashboard
2. Search for "vector"
3. Ensure it's enabled (should be green/active)

## 5. Create Your First Admin User

1. Go to Authentication > Users in Supabase dashboard
2. Click "Add user" > "Create new user"
3. Enter email and password
4. After creation, go to Table Editor > `users` table
5. Find your user and change `role` from `strategist` to `admin`

## 6. Verify Setup

Run these queries in SQL Editor to verify:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check your admin user
SELECT id, email, role FROM public.users;
```

## Schema Overview

- **users**: User profiles extending Supabase auth
- **writer_models**: AI writer model configurations
- **training_content**: Example content for RAG with embeddings
- **categories**: Categories for briefs and projects
- **briefs**: SEO scaffolds/templates
- **projects**: Content creation projects
- **api_keys**: Encrypted API keys for services
- **ai_settings**: Global AI configuration

## Security

- Row Level Security (RLS) is enabled on all tables
- Admins can access everything
- Strategists can only edit their own models and content
- Briefs can be shared or private
- Projects are private to the creator (+ admins)


