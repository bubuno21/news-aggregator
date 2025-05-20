# Supabase Schema & Auth Integration (Latest)

## Article Ingestion Schema

Use this schema to store articles ingested from external news APIs. Articles are unclustered by default (`storyClusterId` is NULL).

```sql
create table "Article" (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  title text not null,
  content text not null,
  publishedAt timestamp with time zone not null,
  source text not null,
  author text,
  urlToImage text,
  storyClusterId uuid references "StoryCluster"(id), -- nullable for unclustered
  createdAt timestamp with time zone default now()
);
```

## StoryCluster Table

```sql
create table "StoryCluster" (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  createdAt timestamp with time zone default now()
);
```

## Supabase Auth & Profiles Table

- Use Supabase's built-in `auth.users` for authentication.
- Store extra user data in a `profiles` table, linked by user UUID.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);
```

## RLS Policy Recommendations

### Article Table (Public Read, No Public Write)
```sql
alter table "Article" enable row level security;
create policy "Public can read articles"
  on "Article"
  for select
  using (true);
```

### StoryCluster Table (Public Read)
```sql
alter table "StoryCluster" enable row level security;
create policy "Public can read clusters"
  on "StoryCluster"
  for select
  using (true);
```

### Profiles Table (User can read/update their own profile)
```sql
alter table profiles enable row level security;
create policy "Users can view their own profile"
  on profiles
  for select
  using (auth.uid() = id);
create policy "Users can update their own profile"
  on profiles
  for update
  using (auth.uid() = id);
```

## Notes
- All user authentication is handled by Supabase Auth (`auth.users`).
- Use the `profiles` table for any additional user data.
- Articles are ingested as unclustered and later assigned to clusters by the clustering service.
- Adjust and extend the schema as needed for comments, votes, etc. 