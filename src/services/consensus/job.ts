import { supabase } from '@/lib/supabaseClient';
import { kmeans } from 'ml-kmeans';

/**
 * Fetch all comments and votes for a given story cluster.
 */
async function fetchCommentsAndVotes(storyId: string) {
  const { data, error } = await supabase
    .from('Comment')
    .select('*, votes:Vote(*)')
    .eq('storyId', storyId);
  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Update a comment with consensus score and cluster label.
 */
async function updateCommentConsensus(commentId: string, consensusScore: number, clusterLabel: string) {
  const { error } = await supabase
    .from('Comment')
    .update({ consensusScore, clusterLabel })
    .eq('id', commentId);
  if (error) throw new Error(error.message);
}

/**
 * Main consensus engine job for a story cluster.
 * 1. Build user-vote matrix
 * 2. Cluster users by voting similarity
 * 3. Compute cross-cluster consensus scores for each comment
 * 4. Update comment ranking metadata in the database
 */
export async function runConsensusJob(storyId: string) {
  const comments = await fetchCommentsAndVotes(storyId);
  if (comments.length === 0) {
    console.log('No comments found for story', storyId);
    return;
  }

  // 1. Build user-vote matrix
  // Map: userId -> index, commentId -> index
  const userIds = Array.from(new Set(comments.flatMap((c: any) => c.votes.map((v: any) => v.userId))));
  const commentIds = comments.map((c: any) => c.id);
  const userIndex: Record<string, number> = {};
  userIds.forEach((uid, i) => { userIndex[uid] = i; });
  const commentIndex: Record<string, number> = {};
  commentIds.forEach((cid, i) => { commentIndex[cid] = i; });

  // Matrix: users x comments, fill with 0 (no vote), 1 (agree), -1 (disagree)
  const matrix: number[][] = Array(userIds.length).fill(0).map(() => Array(commentIds.length).fill(0));
  comments.forEach((comment: any, cIdx: number) => {
    comment.votes.forEach((vote: any) => {
      const uIdx = userIndex[vote.userId];
      matrix[uIdx][cIdx] = vote.value;
    });
  });

  // 2. Cluster users by voting similarity (K-means, k=3 for MVP)
  let userClusters: number[] = [];
  let k = Math.min(3, userIds.length);
  if (userIds.length > 1) {
    const result = kmeans(matrix, k, {});
    userClusters = result.clusters;
  } else {
    userClusters = Array(userIds.length).fill(0); // All in one cluster
  }

  // 3. Compute consensus score for each comment
  // For each comment, for each cluster, compute average vote
  const clusterVotes: Record<string, number[]> = {}; // commentId -> [avgVotePerCluster]
  for (let c = 0; c < commentIds.length; c++) {
    const avgs: number[] = [];
    for (let cluster = 0; cluster < k; cluster++) {
      // Get users in this cluster
      const usersInCluster = userClusters
        .map((cl, idx) => ({ cl, idx }))
        .filter((obj) => obj.cl === cluster)
        .map((obj) => obj.idx);
      if (usersInCluster.length === 0) {
        avgs.push(0);
        continue;
      }
      // Average vote for this comment in this cluster
      const votes = usersInCluster.map((uIdx) => matrix[uIdx][c]);
      avgs.push(votes.reduce((a, b) => a + b, 0) / votes.length);
    }
    clusterVotes[commentIds[c]] = avgs;
  }

  // 4. For each comment, consensus score = min(abs(avgVote)) across clusters (broadest agreement)
  for (let c = 0; c < commentIds.length; c++) {
    const avgs = clusterVotes[commentIds[c]];
    // Consensus score: minimum absolute average vote across clusters (closer to 1 = more consensus)
    const consensusScore = Math.min(...avgs.map((v) => Math.abs(v)));
    // Dominant cluster: the cluster with the highest absolute average vote
    const dominantClusterIdx = avgs.reduce((maxIdx, v, idx, arr) => Math.abs(v) > Math.abs(arr[maxIdx]) ? idx : maxIdx, 0);
    const clusterLabel = `Cluster-${dominantClusterIdx + 1}`;
    await updateCommentConsensus(commentIds[c], consensusScore, clusterLabel);
  }
  console.log('Consensus job complete for story', storyId);
}

// For manual invocation/testing
if (require.main === module) {
  const storyId = process.argv[2];
  if (!storyId) {
    console.error('Usage: node job.js <storyId>');
    process.exit(1);
  }
  runConsensusJob(storyId).catch((err) => {
    console.error('Consensus job error:', err);
  });
} 