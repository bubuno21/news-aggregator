import { NextRequest, NextResponse } from 'next/server';
import { fetchNewsArticles } from '@/services/ingestion/newsapi';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { query, from, to } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    // Fetch articles from NewsAPI
    const articles = await fetchNewsArticles({ q: query, from, to });

    console.log(`Fetched ${articles.length} articles, attempting to insert...`);

    // Insert articles into Supabase (deduplicate by url)
    const { data, error }: { data: any; error: any } = await supabaseAdmin
      .from('Article')
      .upsert(articles, { onConflict: 'url' });

    if (error) {
      console.error('Error upserting articles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ingested: articles.length, inserted: Array.isArray(data) ? data.length : 0 });
  } catch (err: any) {
    console.error('Unexpected error in ingest-news API:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 