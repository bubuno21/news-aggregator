import { supabaseAdmin } from '@/lib/supabaseClient';
import { getEmbeddings } from '@/lib/embeddings';
import { kmeans } from 'ml-kmeans';
// import { getArticleEmbeddings, clusterArticles } from './embedding'; // Placeholder for future logic

/**
 * Fetch all articles from the database that are not yet clustered.
 */
async function fetchUnclusteredArticles() {
  const { data, error } = await supabaseAdmin
    .from('Article')
    .select('*')
    .is('storyClusterId', null);
  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Create a new StoryCluster and return its ID.
 */
async function createStoryCluster(title: string, summary: string | null) {
  const { data, error } = await supabaseAdmin
    .from('StoryCluster')
    .insert([{ title, summary }])
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

/**
 * Update articles with the given IDs to reference the specified storyClusterId.
 */
async function updateArticlesWithCluster(articleIds: string[], storyClusterId: string) {
  const { error } = await supabaseAdmin
    .from('Article')
    .update({ storyClusterId })
    .in('id', articleIds);
  if (error) throw new Error(error.message);
}

/**
 * Main clustering worker function.
 * 1. Fetch unclustered articles
 * 2. Compute embeddings
 * 3. Cluster articles
 * 4. Create/update StoryCluster records and link articles
 */
export async function runClusteringWorker() {
  const articles = await fetchUnclusteredArticles();
  if (articles.length === 0) {
    console.log('No unclustered articles found.');
    return;
  }
  // 1. Compute embeddings for article titles + content
  const texts = articles.map((a: any) => `${a.title}\n${a.content}`);
  const embeddings = await getEmbeddings(texts);

  // 2. Cluster embeddings (K-means, k=5 for MVP)
  const k = Math.min(5, articles.length); // Avoid k > n
  const result = kmeans(embeddings, k, {});

  // 3. Group article indices by cluster
  const clusters: Record<number, number[]> = {};
  result.clusters.forEach((clusterIdx: number, articleIdx: number) => {
    if (!clusters[clusterIdx]) clusters[clusterIdx] = [];
    clusters[clusterIdx].push(articleIdx);
  });

  // 4. For each cluster, create a StoryCluster and update articles
  for (const [clusterIdx, articleIndices] of Object.entries(clusters)) {
    if (!articleIndices || articleIndices.length === 0) continue;
    // TODO: Generate a better title/summary for the cluster
    const title = articles[articleIndices[0]].title;
    const summary = null;
    const storyClusterId = await createStoryCluster(title, summary);
    const articleIds = articleIndices.map((idx) => articles[idx].id);
    await updateArticlesWithCluster(articleIds, storyClusterId);
    console.log(`Cluster ${clusterIdx}: ${articleIds.length} articles assigned to StoryCluster ${storyClusterId}`);
  }
  console.log('Clustering complete.');
}

// For manual invocation/testing
if (require.main === module) {
  runClusteringWorker().catch((err) => {
    console.error('Clustering worker error:', err);
  });
} 