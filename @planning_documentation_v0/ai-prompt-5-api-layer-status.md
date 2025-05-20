# AI Prompt 5: API Layer — Status & Implementation Update

## Status
- **API endpoints scaffolded:**
  - `src/app/api/news/route.ts` — GET (list story clusters with articles), POST (add article)
  - `src/app/api/comments/route.ts` — GET (list comments for a story), POST (add comment)
  - `src/app/api/votes/route.ts` — POST (add vote to a comment)
- **Validation:** All request bodies validated with Zod schemas.
- **Error handling:** Typed JSON error responses with clear messages.

## Implementation Details
- Endpoints follow RESTful conventions and Next.js App Router structure.
- Zod schemas ensure type safety and input validation for all POST requests.
- GET endpoints for news and comments support listing with filtering.

## Next Steps
- Add authentication and authorization checks (e.g., Supabase JWT verification).
- Expand endpoints for pagination, filtering, and richer error handling as needed.
- Begin work on consensus engine (`src/services/consensus/job.ts`). 