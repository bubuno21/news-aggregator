# Adding storyClusterId Column to Article Table

We encountered an error when running the clustering service:
```
"error":"column Article.storyClusterId does not exist"
```

## Analysis

The database schema is missing the `storyClusterId` column in the `Article` table that was specified in our original schema design. This column is essential for linking articles to their clusters.

## Solution

Run the following SQL in your Supabase SQL Editor to add the missing column:

```sql
-- First check if StoryCluster table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'StoryCluster') THEN
    -- Create StoryCluster table if it doesn't exist
    CREATE TABLE "StoryCluster" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      summary text,
      createdAt timestamp with time zone DEFAULT now()
    );
  END IF;
END
$$;

-- Add storyClusterId column to Article table if it doesn't exist
ALTER TABLE "Article"
ADD COLUMN IF NOT EXISTS "storyClusterId" uuid REFERENCES "StoryCluster"(id);

-- Confirm the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Article' 
ORDER BY ordinal_position;
```

## Verification

After running the SQL, you should see `storyClusterId` listed in the column results, with a data type of `uuid`.

## Next Steps

1. Run the clustering service again to group articles into story clusters
2. Check that articles are properly linked to their StoryCluster records
3. Verify in the UI that stories are displayed correctly grouped by cluster 