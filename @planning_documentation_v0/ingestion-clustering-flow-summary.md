# News Aggregator: Ingestion to Clustering Flow

## Overview

We've successfully implemented a complete article ingestion and clustering pipeline for the news aggregator project:

1. **Ingestion Service**: Pulls articles from external news APIs
2. **Database Storage**: Stores articles in Supabase with advanced schema
3. **Clustering Service**: Groups related articles into story clusters
4. **API Endpoints**: Provides access to articles and clusters

## Flow Diagram

```
┌─────────────────┐      ┌───────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                   │      │                 │      │                 │
│  External API   │──────▶  Ingestion API    │──────▶   Unclustered   │──────▶  Clustering API │
│  (NewsAPI.org)  │      │  /api/ingest-news │      │    Articles     │      │ /api/cluster-news│
│                 │      │                   │      │                 │      │                 │
└─────────────────┘      └───────────────────┘      └─────────────────┘      └────────┬────────┘
                                                                                      │
                                                                                      │
                         ┌───────────────────┐      ┌─────────────────┐              │
                         │                   │      │                 │              │
                         │    News API       │◀─────┤   Clustered     │◀─────────────┘
                         │   /api/news       │      │    Articles     │
                         │                   │      │                 │
                         └───────────────────┘      └─────────────────┘
```

## Components

### 1. Ingestion Pipeline

- **NewsAPI Service** (`src/services/ingestion/newsapi.ts`): Fetches articles from external API
- **Ingest News API** (`src/app/api/ingest-news/route.ts`): API endpoint to trigger ingestion
- **Data Storage**: Stores articles in Supabase `Article` table with `storyClusterId` initially null

### 2. Clustering Pipeline

- **Clustering Worker** (`src/services/clustering/worker.ts`): Advanced clustering using OpenAI embeddings
- **Simple Clustering Worker** (`src/services/clustering/simple-worker.ts`): Keyword-based fallback clustering
- **Cluster News API** (`src/app/api/cluster-news/route.ts`): API endpoint to trigger clustering
- **Result**: Articles assigned to StoryCluster records via `storyClusterId` field

### 3. Access Pipeline

- **News API** (`src/app/api/news/route.ts`): Retrieves clustered articles for display
- **Frontend**: Displays articles grouped by cluster

## Database Schema

```
Article                       StoryCluster
+-----------------+          +----------------+
| id (uuid)       |          | id (uuid)      |
| url (text)      |          | title (text)   |
| title (text)    |          | summary (text) |
| content (text)  |     ┌────┤ createdAt      |
| publishedAt     |     │    +----------------+
| source (text)   |     │
| storyClusterId  |─────┘
| createdAt       |
+-----------------+
```

## Current Status

- **Articles Ingested**: 50
- **Clusters Created**: 6 (Tech, AI, Economy, Sport, Health, Other)
- **Clustering Method**: Simple keyword-based (OpenAI embeddings ready when quota available)

## Next Steps

1. **Scheduled Jobs**: Automate ingestion and clustering
2. **Improved Clustering**: Activate OpenAI embeddings clustering for better results
3. **UI Enhancements**: Improve article display and navigation between clusters 