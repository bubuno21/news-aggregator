# API Routes Migration

## Overview

We migrated the API routes to follow the standard Next.js App Router structure. This migration ensures consistency and adheres to Next.js best practices.

## Changes Made

- **Old Structure**: `/src/api/[route-name]/route.ts`
- **New Structure**: `/src/app/api/[route-name]/route.ts`

The following routes were migrated:

| Old Path | New Path | Status |
|----------|----------|--------|
| `/src/api/ingest-news/route.ts` | `/src/app/api/ingest-news/route.ts` | ✅ Migrated |

## Standard API Route Structure

All API routes now follow the Next.js App Router convention:

```
src/
  app/
    api/
      [route-name]/
        route.ts
```

## Existing Routes in Standard Structure

The following API routes were already using the standard structure:

- `/src/app/api/comments/route.ts`
- `/src/app/api/news/route.ts`
- `/src/app/api/votes/route.ts`

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ingest-news` | POST | Ingest articles from external news API |
| `/api/news` | GET | Get story clusters |
| `/api/news` | POST | Add a new article |
| `/api/comments` | GET | Get comments for a story |
| `/api/comments` | POST | Add a new comment |
| `/api/votes` | POST | Submit a vote for a comment |

## How to Use

To trigger article ingestion:

```bash
curl -X POST http://localhost:3000/api/ingest-news -H "Content-Type: application/json" -d '{"query":"technology"}'
``` 