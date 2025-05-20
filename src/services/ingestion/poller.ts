import { fetchNewsArticles } from './newsapi';
import { supabase } from '@/lib/supabaseClient';

const QUERY = 'latest'; // Default query for MVP
const POLL_INTERVAL = 1000 * 60 * 10; // 10 minutes

async function pollNews() {
  try {
    const articles = await fetchNewsArticles(QUERY);
    if (articles.length === 0) {
      console.log('No new articles fetched.');
      return;
    }
    // Upsert articles into Supabase (deduplicate by url)
    const { data, error }: { data: any; error: any } = await supabase
      .from('Article')
      .upsert(articles, { onConflict: 'url' });
    if (error) {
      console.error('Error upserting articles:', error.message);
    } else {
      const insertedCount = Array.isArray(data) ? data.length : 0;
      console.log(`Ingested ${articles.length} articles, inserted: ${insertedCount}`);
    }
  } catch (err: any) {
    console.error('Poller error:', err.message);
  }
}

// Run poller on interval
setInterval(pollNews, POLL_INTERVAL);

// Run once on start
pollNews(); 