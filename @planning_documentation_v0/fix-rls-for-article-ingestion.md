# Fix RLS Policy for Article Ingestion

We encountered an error when trying to ingest articles via the API:
```
new row violates row-level security policy for table "Article"
```

## Analysis

The current RLS policy on the `Article` table only allows read access (SELECT) but does not permit INSERT operations from our API service:

```sql
-- Current policy:
alter table "Article" enable row level security;
create policy "Public can read articles"
  on "Article"
  for select
  using (true);
```

## Solution

We need to add another policy to allow inserts from our service. Since our API endpoints are authenticated via Supabase, we have two options:

### Option 1: Service Role (Recommended)
Use a Supabase service role key for the ingestion service:

```sql
-- Allow inserts with the service role
create policy "Service can insert articles"
  on "Article"
  for insert
  using (true)
  with check (true);
```

### Option 2: Add a specific role for ingestion

```sql
-- Create a role for article ingestion
create role article_ingestion_service;

-- Grant permissions to the role
grant usage on schema public to article_ingestion_service;
grant all privileges on table "Article" to article_ingestion_service;

-- Create policy allowing this role to insert
create policy "Article ingestion service can insert"
  on "Article"
  for insert
  using (current_user = 'article_ingestion_service');
```

## Execute in Supabase SQL Editor

Run the following SQL in your Supabase SQL Editor:

```sql
-- Add policy to allow inserting articles (simplest solution)
create policy "Service can insert articles"
  on "Article" 
  for insert
  with check (true);
```

This policy allows any authenticated request to insert articles, which is sufficient for our news ingestion service. 