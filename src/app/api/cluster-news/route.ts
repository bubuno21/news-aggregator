import { NextRequest, NextResponse } from 'next/server';
// import { runClusteringWorker } from '@/services/clustering/worker';
import { runSimpleClusteringWorker } from '@/services/clustering/simple-worker';

export async function POST(req: NextRequest) {
  try {
    console.log('Cluster-news API: Starting simple clustering worker...');
    const result = await runSimpleClusteringWorker();
    return NextResponse.json({ 
      success: true, 
      message: 'Clustering process completed',
      processed: result.processed,
      clusters: result.clusters 
    });
  } catch (err: any) {
    console.error('Error in clustering API:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to run clustering process' },
      { status: 500 }
    );
  }
} 