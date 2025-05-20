import axios from 'axios';

const NEWSAPI_KEY = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
const NEWSAPI_URL = 'https://newsapi.org/v2/everything';

export interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NormalizedArticle {
  url: string;
  title: string;
  content: string;
  publishedAt: string;
  source: string;
}

export interface FetchNewsOptions {
  q: string;
  from?: string;
  to?: string;
  pageSize?: number;
  sortBy?: 'publishedAt' | 'relevancy' | 'popularity';
}

export async function fetchNewsArticles({
  q,
  from,
  to,
  pageSize = 50,
  sortBy = 'publishedAt',
}: FetchNewsOptions): Promise<NormalizedArticle[]> {
  if (!NEWSAPI_KEY) {
    throw new Error('NewsAPI key is not configured');
  }

  const params = new URLSearchParams({
    q,
    language: 'en',
    sortBy,
    apiKey: NEWSAPI_KEY,
    pageSize: String(pageSize),
  });
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const url = `${NEWSAPI_URL}?${params.toString()}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.status !== 'ok') {
    const errorMsg = data.message || 'Unknown error from NewsAPI';
    const errorCode = data.code || 'unexpectedError';
    throw new Error(`NewsAPI error (${errorCode}): ${errorMsg}`);
  }

  if (!Array.isArray(data.articles)) {
    throw new Error('Invalid articles data from NewsAPI');
  }

  return data.articles.map((a: NewsApiArticle) => ({
    url: a.url,
    title: a.title,
    content: a.content || a.description || '',
    publishedAt: a.publishedAt,
    source: a.source.name,
  }));
} 