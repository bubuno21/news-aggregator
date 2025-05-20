# Clustering Service Documentation

## Overview

The clustering service groups related news articles into story clusters based on their semantic similarity. This process runs as a background job that:

1. Fetches all unclustered articles from the database
2. Computes embeddings for each article using OpenAI's text embedding model
3. Applies K-means clustering to group similar articles
4. Creates a StoryCluster record for each group and links articles to it

## Architecture

The clustering service consists of:

- **Worker (`/src/services/clustering/worker.ts`)**: Main clustering logic
- **API Route (`/src/app/api/cluster-news/route.ts`)**: Endpoint to trigger clustering manually
- **Library (`/src/lib/embeddings.ts`)**: Handles interaction with OpenAI's embedding API

## How It Works

1. **Fetch Unclustered Articles**
   - Retrieve all articles with `storyClusterId = null` from the database

2. **Generate Embeddings**
   - Convert article text (title + content) into vector embeddings
   - Uses OpenAI's text-embedding-3-small model via LangChain

3. **Cluster Articles**
   - Apply K-means clustering algorithm to group similar articles
   - Default: 5 clusters (or fewer if there are less than 5 articles)

4. **Create Story Clusters**
   - For each cluster, create a `StoryCluster` record
   - Use the title of the first article as the cluster title (can be improved)
   - Link all articles in the cluster to this `StoryCluster` via `storyClusterId`

## Dependencies

- **OpenAI API Key**: Required for generating embeddings
- **Supabase Admin Key**: Required for database operations that bypass RLS policies
- **ml-kmeans**: For clustering algorithm implementation

## How to Run

### Via API Endpoint

```bash
# Trigger clustering process via API
curl -X POST http://localhost:3000/api/cluster-news
```

### Via Manual Script

You can also run the clustering worker directly:

```bash
# Using tsx to run TypeScript directly
npx tsx src/services/clustering/worker.ts
```

## Future Improvements

1. **Better Cluster Titles**: Generate summarized titles for each cluster
2. **Dynamic Clustering**: Adjust number of clusters based on data
3. **Incremental Updates**: Only re-cluster when new articles arrive
4. **Error Handling**: Improved retry and logging for production use 