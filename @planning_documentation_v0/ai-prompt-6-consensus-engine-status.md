# AI Prompt 6: Consensus Engine — Status & Implementation Update

## Status
- **Consensus engine job scaffolded:** `src/services/consensus/job.ts` — Fetches all comments and votes for a story, provides structure for user clustering and consensus scoring.
- **TODOs added:** Placeholders for user-vote matrix, clustering, and consensus score computation.

## Implementation Details
- The job fetches all comments and their votes for a given story cluster.
- For each comment, updates consensus score and cluster label (dummy values for now).
- Designed for manual invocation and future automation.

## Next Steps
- Implement user-vote matrix construction.
- Add clustering logic for users by voting similarity (e.g., matrix factorization, graph clustering).
- Compute cross-cluster consensus scores for each comment.
- Integrate with API and UI for real-time updates and metrics display. 