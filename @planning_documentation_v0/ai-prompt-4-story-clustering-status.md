# AI Prompt 4: Story Clustering Worker — Status & Implementation Update

## Status
- **Clustering worker scaffolded:** `src/services/clustering/worker.ts` — Fetches unclustered articles from the database and provides a structure for future embedding and clustering logic.
- **OpenAI + LangChain embedding utility scaffolded:** `src/lib/embeddings.ts` — Provides a function to embed article texts using OpenAI via LangChain.
- **TODOs added:** Placeholders for text embedding computation, clustering, and updating StoryCluster records.

## Implementation Details
- The worker fetches all articles without a `storyClusterId`.
- Embedding utility uses OpenAI via LangChain for text embeddings (API key required in env).
- Clear TODOs are present for integrating NLP embedding and clustering logic.
- Designed for manual invocation and future automation.

## Next Steps
- Integrate `getEmbeddings` into the clustering worker.
- Add clustering logic (e.g., K-means, agglomerative, or transformer-based similarity).
- Create StoryCluster records and update articles with cluster assignments.
- Integrate with ingestion pipeline for automated clustering after ingestion. 