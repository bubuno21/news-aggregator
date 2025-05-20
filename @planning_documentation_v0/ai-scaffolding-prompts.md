# AI Scaffolding Prompts for News Aggregator with Crowdsourced Bias Insights

This file provides a step-by-step scaffolding plan using AI prompts to build the product, referencing the Product Requirements Document and Technical Implementation & Architecture Plan.

---

## 1. Project Initialization

**Prompt:**
```
Initialize a new Next.js (App Router, TypeScript) project with Tailwind CSS and Shadcn UI. Set up the project structure as described in the technical architecture plan, including folders for `lib/`, `services/`, `app/`, and `prisma/`. Add a `README.md` and `.env.example` file. Configure Prettier and ESLint for auto-formatting and linting.
```

---

## 2. Supabase & Database Setup

**Prompt:**
```
Integrate Supabase for authentication, Postgres database, and storage. Scaffold a `prisma/schema.prisma` file for core models: User, Article, StoryCluster, Comment, Vote, and any necessary linking tables. Generate the Prisma client and set up migrations. Add Supabase environment variables to `.env.example`.
```

---

## 3. News Ingestion Service

**Prompt:**
```
Create a service in `services/ingestion/` with a poller that fetches news articles from NewsAPI and/or RSS feeds. Implement a parser/normalizer to standardize article data. Store raw articles in the database. Ensure the service is modular for future source expansion.
```

---

## 4. Story Clustering Worker

**Prompt:**
```
Implement a clustering worker in `services/clustering/worker.ts` that processes new articles, computes text embeddings (using a suitable NLP model or API), and groups articles into story clusters based on semantic similarity. Store clusters in the database, linking articles to clusters.
```

---

## 5. API Layer (Next.js API Routes)

**Prompt:**
```
Scaffold Next.js API routes under `app/api/` for:
- `/api/news` (GET: list stories with articles, POST: add article)
- `/api/comments` (GET/POST)
- `/api/votes` (POST)

Use Zod for request/response validation. Ensure all endpoints are typed and return clear error messages.
```

---

## 6. Consensus Engine

**Prompt:**
```
Create a consensus engine in `services/consensus/job.ts` that:
- Reads all comments and votes for a story
- Clusters users by voting similarity (e.g., using matrix factorization or graph clustering)
- Computes cross-cluster consensus scores for each comment
- Updates comment ranking metadata in the database
- Exposes cluster metrics for the frontend
```

---

## 7. Frontend Scaffolding

**Prompt:**
```
Set up the Next.js App Router structure in `app/`. Scaffold pages for:
- Main feed (list of story clusters)
- Story detail (cluster view with articles, comments, consensus notes)
- Auth (login/register)

Use Shadcn UI components for all UI elements. Integrate Tailwind CSS for styling. Implement light/dark mode with theme persistence.
```

---

## 8. Comments & Voting UI

**Prompt:**
```
Build comment and voting components using Shadcn UI. Display comments with cluster support indicators and consensus notes. Allow registered users to add comments and vote. Show loading and error states for all async actions.
```

---

## 9. Real-Time Updates

**Prompt:**
```
Implement real-time updates for comment rankings and consensus metrics using WebSockets or polling. Ensure the frontend updates dynamically as new votes/comments are processed.
```

---

## 10. Testing & Quality

**Prompt:**
```
Add unit and integration tests for ingestion, clustering, consensus, and API endpoints. Use Jest or Vitest. Ensure all code passes linting and type checks. Add test cases for edge scenarios (e.g., duplicate articles, conflicting votes).
```

---

## 11. Deployment

**Prompt:**
```
Create a `docker-compose.yml` for local development with Supabase/Postgres. Add deployment scripts/config for Vercel. Document environment variables and setup steps in the `README.md`.
```

---

## 12. UX & Performance Polishing

**Prompt:**
```
Add skeleton loaders, error boundaries, and performance optimizations (lazy loading, pagination). Refine the UI/UX for clarity, especially for cluster/consensus indicators. Ensure accessibility and mobile responsiveness.
```

---

## 13. Final Review

**Prompt:**
```
Review the implementation against the PRD and technical plan. Ensure all major features, flows, and requirements are met. Prepare a demo script and screenshots for the final presentation.
``` 