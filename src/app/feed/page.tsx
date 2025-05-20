"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/user-context';
import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, NewspaperIcon } from "lucide-react";

interface Article {
  id: string;
  url: string;
  title: string;
  content: string;
  publishedAt: string;
  source: string;
}

interface StoryCluster {
  id: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  articles: Article[];
  createdAt: string;
}

async function fetchClusters(): Promise<StoryCluster[]> {
  const res = await fetch('/api/news');
  if (!res.ok) throw new Error('Failed to fetch clusters');
  const data = await res.json();
  return data.clusters;
}

export default function FeedPage() {
  const { user } = useUser();
  const router = useRouter();

  const { data, isLoading, error } = useQuery<StoryCluster[]>({
    queryKey: ['clusters'],
    queryFn: fetchClusters,
  });

  return (
    <div className="min-h-screen container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {!user && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-lg">
              <span className="font-semibold text-primary">Join the conversation!</span>
              <span className="text-muted-foreground">Sign up or log in to comment and vote on stories.</span>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={() => router.push('/login')}>Login</Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/register')}>Register</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">News Feed</h1>
        <p className="text-lg text-muted-foreground">Stay informed with the latest stories and discussions</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="py-6">
            <div className="text-destructive font-medium">Error loading feed: {(error as Error).message}</div>
          </CardContent>
        </Card>
      ) : !data || data.length === 0 ? (
        <Card className="bg-muted">
          <CardContent className="py-6">
            <div className="text-muted-foreground text-center">No stories found at the moment.</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
          {data.map((cluster) => (
            <Link key={cluster.id} href={`/story/${cluster.id}`} className="group">
              <Card className="transition-transform duration-200 group-hover:scale-105 shadow-xl border-2 border-fuchsia-200 dark:border-fuchsia-700 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
                {cluster.imageUrl && (
                  <div className="relative h-40 w-full rounded-t-lg overflow-hidden">
                    <Image
                      src={cluster.imageUrl}
                      alt={cluster.title}
                      fill
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-fuchsia-700 dark:text-fuchsia-300 text-lg font-bold flex items-center gap-2">
                    {cluster.title}
                    <Badge className="ml-2 bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-semibold px-2 py-1 rounded-full">
                      {cluster.articles.length} {cluster.articles.length === 1 ? 'Article' : 'Articles'}
                    </Badge>
                  </CardTitle>
                  {cluster.summary && (
                    <CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
                      {cluster.summary}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Updated {new Date(cluster.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="outline" className="border-fuchsia-300 dark:border-fuchsia-700 text-fuchsia-700 dark:text-fuchsia-300 bg-white/70 dark:bg-black/30 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30 transition-colors">
                    View Story
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 