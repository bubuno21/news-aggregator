# Environment Variables

The project requires the following environment variables to be set in the `.env.local` file:

## Supabase Configuration

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For server-side admin operations (like article ingestion)
# ⚠️ WARNING: This key has admin privileges - only use server-side!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## News API Configuration

```
# News API Configuration  
NEXT_PUBLIC_NEWSAPI_KEY=your-newsapi-key
```

## OpenAI Configuration (For Clustering)

```
# OpenAI API Key for embeddings and clustering
OPENAI_API_KEY=your-openai-api-key
```

## How to Get These Keys

1. **Supabase Keys** 
   - Log in to your Supabase dashboard
   - Go to Project Settings > API
   - Copy the URL, anon key, and service role key

2. **NewsAPI Key**
   - Register at [newsapi.org](https://newsapi.org/)
   - Get your API key from the dashboard

3. **OpenAI API Key**
   - Sign up at [platform.openai.com](https://platform.openai.com/)
   - Create an API key from the API keys section
   - Note: This is used for article clustering via embeddings

## Usage

- NEXT_PUBLIC_* variables are accessible client-side
- SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY are only used server-side
- The service role key bypasses RLS policies and has admin privileges 