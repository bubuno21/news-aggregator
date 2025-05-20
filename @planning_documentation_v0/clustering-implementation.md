# News Article Clustering Implementation

## Overview

We implemented a clustering service that groups related news articles into story clusters. Due to OpenAI API rate limits, we created two implementations:

1. **Full Embeddings-based Clustering** (`src/services/clustering/worker.ts`)
   - Uses OpenAI embeddings for semantic similarity
   - Implements K-means clustering on the embedding vectors
   - More accurate but requires an active OpenAI API key with sufficient quota

2. **Simple Keyword-based Clustering** (`src/services/clustering/simple-worker.ts`)
   - Uses basic keyword matching instead of embeddings
   - Groups articles based on frequency of predefined terms
   - Less accurate but doesn't require external API calls

## Implementation Details

### API Endpoint

We created an API endpoint at `/api/cluster-news` that can be called to trigger the clustering process. This endpoint:

- Takes no parameters
- Runs the clustering worker asynchronously
- Returns information about the clustering results

### Database Structure

Articles are stored in a table with the following structure:
- Initially, articles are stored with `storyClusterId = null`
- After clustering, articles are assigned to a `StoryCluster` via the `storyClusterId` column

### Clustering Process

1. **Fetch unclustered articles** from the database
2. **Apply clustering algorithm** (embeddings-based or keyword-based)
3. **Create StoryCluster records** for each cluster
4. **Update articles** to link them to their respective clusters

## Current Status

We successfully ran the simple keyword-based clustering and processed 50 articles into 6 clusters:

- Tech News
- AI News
- Economy News
- Sport News
- Politics News
- Health News
- Other News (catch-all for unmatched articles)

## Next Steps

1. **Implement OpenAI embeddings clustering** when API quota is available
2. **Improve cluster titles and summaries** using better natural language processing
3. **Add scheduling** for automatic reclustering of new articles
4. **Enhance UI** to display articles grouped by story clusters 