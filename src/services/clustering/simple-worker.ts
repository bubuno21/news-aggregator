import { supabaseAdmin } from '@/lib/supabaseClient';

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
 * Simple word-based clustering for testing purposes
 * This doesn't use embeddings, just naive word frequency
 */
function simpleCluster(articles: any[]) {
  // Extract key terms from titles
  const keyTerms = ['tech', 'AI', 'economy', 'sport', 'politics', 'health'];
  const clusters: Record<string, number[]> = {};
  
  // Initialize clusters
  keyTerms.forEach(term => {
    clusters[term] = [];
  });
  
  // Assign articles to clusters based on simple keyword matching
  articles.forEach((article, idx) => {
    const title = article.title.toLowerCase();
    const content = article.content.toLowerCase();
    
    // Determine which term is most prevalent
    let assignedCluster = 'other';
    let maxCount = 0;
    
    keyTerms.forEach(term => {
      const termLower = term.toLowerCase();
      const titleCount = (title.match(new RegExp(termLower, 'g')) || []).length;
      const contentCount = (content.match(new RegExp(termLower, 'g')) || []).length;
      const count = titleCount * 3 + contentCount; // Title matches weighted higher
      
      if (count > maxCount) {
        maxCount = count;
        assignedCluster = term;
      }
    });
    
    // If no terms matched well, put in 'other'
    if (maxCount === 0) {
      if (!clusters['other']) clusters['other'] = [];
      clusters['other'].push(idx);
    } else {
      clusters[assignedCluster].push(idx);
    }
  });
  
  // Filter out empty clusters
  const filteredClusters: Record<string, number[]> = {};
  Object.entries(clusters).forEach(([term, indices]) => {
    if (indices.length > 0) {
      filteredClusters[term] = indices;
    }
  });
  
  return filteredClusters;
}

/**
 * Main simple clustering worker function.
 */
export async function runSimpleClusteringWorker() {
  const articles = await fetchUnclusteredArticles();
  if (articles.length === 0) {
    console.log('No unclustered articles found.');
    return { processed: 0, clusters: 0 };
  }
  
  console.log(`Found ${articles.length} unclustered articles.`);
  
  // Cluster articles based on simple word matching
  const clusters = simpleCluster(articles);
  const clusterCount = Object.keys(clusters).length;
  
  console.log(`Created ${clusterCount} clusters.`);
  
  // For each cluster, create a StoryCluster and update articles
  for (const [term, articleIndices] of Object.entries(clusters)) {
    if (!articleIndices || articleIndices.length === 0) continue;
    
    // Generate a title for the cluster
    const title = `${term.charAt(0).toUpperCase() + term.slice(1)} News`;
    const summary = `A collection of ${articleIndices.length} articles about ${term}`;
    
    const storyClusterId = await createStoryCluster(title, summary);
    const articleIds = articleIndices.map((idx) => articles[idx].id);
    
    await updateArticlesWithCluster(articleIds, storyClusterId);
    console.log(`Cluster "${term}": ${articleIds.length} articles assigned to StoryCluster ${storyClusterId}`);
  }
  
  console.log('Simple clustering complete.');
  return { processed: articles.length, clusters: clusterCount };
}

// For manual invocation/testing
if (require.main === module) {
  runSimpleClusteringWorker().catch((err) => {
    console.error('Simple clustering worker error:', err);
  });
} 