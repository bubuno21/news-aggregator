import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';

const ArticleSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  content: z.string(),
  publishedAt: z.string(),
  source: z.string(),
});

// UUID validation function
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/news - Retrieving story clusters');
    
    // Check if we're requesting a specific cluster by ID
    const { searchParams } = new URL(req.url);
    const clusterId = searchParams.get('clusterId');
    
    let query = supabase
      .from('StoryCluster')
      .select('id, title, summary, createdAt, articles:Article(*)');
    
    // If clusterId is provided and it's a valid UUID, filter for that specific cluster
    if (clusterId && isValidUUID(clusterId)) {
      console.log(`Filtering for cluster ID: ${clusterId}`);
      query = query.eq('id', clusterId);
    } else if (clusterId) {
      // Handle special routes or invalid UUIDs
      console.log(`Invalid UUID format: ${clusterId}, returning empty clusters array`);
      return NextResponse.json({ clusters: [] }, { status: 200 });
    } else {
      // Otherwise, order by creation date (newest first)
      query = query.order('createdAt', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error fetching clusters:', error);
      throw new Error(error.message);
    }
    
    // Debug the result
    console.log(`Found ${data?.length || 0} clusters`);
    if (data && data.length > 0) {
      for (const cluster of data) {
        console.log(`Cluster ${cluster.id}: ${cluster.title} with ${Array.isArray(cluster.articles) ? cluster.articles.length : 0} articles`);
      }
    }
    
    return NextResponse.json({ clusters: data || [] }, { status: 200 });
  } catch (err: any) {
    console.error('API /news GET error:', err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('Article')
      .insert([parsed.data])
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ article: data }, { status: 201 });
  } catch (err: any) {
    console.error('API /news POST error:', err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 