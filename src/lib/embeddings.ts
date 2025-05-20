import { OpenAIEmbeddings } from '@langchain/openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const embeddings = new OpenAIEmbeddings({ apiKey: OPENAI_API_KEY });

/**
 * Get embeddings for an array of texts using OpenAI via LangChain.
 * @param texts Array of strings to embed
 * @returns Promise<number[][]> Embedding vectors
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  return embeddings.embedDocuments(texts);
} 