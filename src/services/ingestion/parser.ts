import { NewsApiArticle, NormalizedArticle } from './newsapi';

/**
 * Normalize a raw NewsApiArticle into a NormalizedArticle for storage.
 */
export function normalizeArticle(article: NewsApiArticle): NormalizedArticle {
  return {
    url: article.url,
    title: article.title.trim(),
    content: article.content?.trim() || article.description?.trim() || '',
    publishedAt: article.publishedAt,
    source: article.source.name,
  };
}

/**
 * Normalize an array of NewsApiArticle objects.
 */
export function normalizeArticles(articles: NewsApiArticle[]): NormalizedArticle[] {
  return articles.map(normalizeArticle);
} 