"use client";
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { Pencil, Trash2, ThumbsUp, ThumbsDown, ArrowLeft, Share2, ExternalLink, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Article {
  id: string;
  url: string;
  title: string;
  content: string;
  publishedAt: string;
  source: string;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  consensusScore: number | null;
  clusterLabel: string | null;
}

interface StoryCluster {
  id: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  articles: Article[];
}

async function fetchCluster(clusterId: string): Promise<StoryCluster | null> {
  console.log(`Fetching cluster with ID: ${clusterId}`);
  const res = await fetch(`/api/news?clusterId=${encodeURIComponent(clusterId)}`);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('Error response from API:', errorData);
    throw new Error(errorData.error || 'Failed to fetch cluster');
  }
  
  const data = await res.json();
  
  // Debug what we received
  console.log(`Received ${data.clusters?.length || 0} clusters from API`);
  
  // Check if clusters exist and is an array
  if (!data.clusters || !Array.isArray(data.clusters) || data.clusters.length === 0) {
    console.error('No clusters found in API response', data);
    return null;
  }
  
  // Since we filtered by ID in the API, we should have at most one result
  const cluster = data.clusters[0];
  
  if (cluster) {
    // Ensure the articles field is properly formatted
    return {
      id: cluster.id,
      title: cluster.title || 'Untitled Cluster',
      summary: cluster.summary,
      imageUrl: cluster.imageUrl,
      articles: Array.isArray(cluster.articles) ? cluster.articles : []
    };
  }
  
  return null;
}

async function fetchComments(storyId: string): Promise<Comment[]> {
  const res = await fetch(`/api/comments?storyId=${storyId}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  const data = await res.json();
  return data.comments;
}

async function postComment({ storyId, userId, content }: { storyId: string; userId: string; content: string }) {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyId, userId, content }),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

async function updateComment({ id, userId, content }: { id: string; userId: string; content: string }) {
  const res = await fetch('/api/comments', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, userId, content }),
  });
  if (!res.ok) throw new Error('Failed to update comment');
  return res.json();
}

async function deleteComment({ id, userId }: { id: string; userId: string }) {
  const res = await fetch(`/api/comments?id=${id}&userId=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete comment');
  return res.json();
}

async function postVote({ commentId, userId, value }: { commentId: string; userId: string; value: 1 | -1 }) {
  const res = await fetch('/api/votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId, userId, value }),
  });
  if (!res.ok) throw new Error('Failed to submit vote');
  return res.json();
}

export default function StoryDetailPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { clusterId } = useParams<{ clusterId: string }>();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const { data: cluster, isLoading, error } = useQuery<StoryCluster | null>({
    queryKey: ['cluster', clusterId],
    queryFn: () => fetchCluster(clusterId),
    enabled: !!clusterId,
    retry: 1, // Only retry once to avoid infinite retries on permanent failures
  });

  const { data: comments, isLoading: loadingComments, error: errorComments } = useQuery<Comment[]>({
    queryKey: ['comments', clusterId],
    queryFn: () => fetchComments(clusterId),
    enabled: !!clusterId,
  });

  const commentMutation = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', clusterId] });
      toast("Comment posted", {
        description: "Your comment has been added to the discussion."
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      setEditingCommentId(null);
      setEditCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', clusterId] });
      toast("Comment updated", {
        description: "Your comment has been updated."
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', clusterId] });
      toast("Comment deleted", {
        description: "Your comment has been removed."
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: postVote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', clusterId] });
      const actionMessages = {
        created: "Your vote has been recorded.",
        updated: "Your vote has been changed.",
        removed: "Your vote has been removed."
      };
      toast("Vote submitted", {
        description: actionMessages[data.action as keyof typeof actionMessages] || "Vote processed."
      });
    },
  });

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ id: commentId, userId: user.id });
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !cluster) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-semibold text-lg">Error loading story</span>
              <span>{(error as Error)?.message || 'Story not found'}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/feed')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Feed
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Navigation and Share */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/feed')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Story
          </Button>
        </div>

        {/* Main Story Card */}
        <Card className="max-w-2xl mx-auto mt-8 shadow-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
          {cluster.imageUrl && (
            <div className="relative h-56 w-full rounded-t-lg overflow-hidden">
              <Image
                src={cluster.imageUrl}
                alt={cluster.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-700 dark:text-blue-200 text-2xl font-extrabold flex items-center gap-2">
              {cluster.title}
              <Badge className="ml-2 bg-fuchsia-200 text-fuchsia-900 dark:bg-fuchsia-900 dark:text-fuchsia-100 font-semibold px-2 py-1 rounded-full">
                {cluster.articles.length} {cluster.articles.length === 1 ? 'Article' : 'Articles'}
              </Badge>
            </CardTitle>
            {cluster.summary && (
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
                {cluster.summary}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {cluster.articles.map((article) => (
              <div key={article.id} className="rounded-lg border border-fuchsia-100 dark:border-fuchsia-800 bg-white/80 dark:bg-black/30 p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-fuchsia-700 dark:text-fuchsia-300 hover:underline flex items-center gap-1">
                    {article.title}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-gray-700 dark:text-gray-200 text-sm line-clamp-3">
                  {article.content}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-semibold px-2 py-1 rounded-full">
                    {article.source}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              className="border-fuchsia-300 dark:border-fuchsia-700 text-fuchsia-700 dark:text-fuchsia-300 bg-white/70 dark:bg-black/30 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30 transition-colors flex items-center gap-2"
              onClick={() => router.push('/feed')}
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Feed
            </Button>
            <Button
              variant="secondary"
              className="bg-gradient-to-r from-fuchsia-400 via-blue-400 to-purple-400 text-white dark:from-fuchsia-700 dark:via-blue-700 dark:to-purple-700 shadow-md hover:scale-105 transition-transform flex items-center gap-2"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied!');
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </CardFooter>
        </Card>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion
            </h3>
            <Badge variant="outline" className="font-normal">
              {comments?.length || 0} comments
            </Badge>
          </div>

          {user && (
            <form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (comment.trim() && user) {
                  commentMutation.mutate({ storyId: cluster.id, userId: user.id, content: comment });
                }
              }}
              className="space-y-4"
            >
              <Textarea
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                disabled={commentMutation.isPending}
                className="min-h-24"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={commentMutation.isPending || !comment.trim()}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </form>
          )}

          {loadingComments ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : errorComments ? (
            <div className="text-destructive bg-destructive/5 p-4 rounded-lg">
              Error loading comments: {(errorComments as Error).message}
            </div>
          ) : !comments || comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <Card key={c.id} className="bg-muted/30">
                  <CardContent className="py-4">
                    {editingCommentId === c.id ? (
                      <div className="space-y-4">
                        <Textarea 
                          value={editCommentContent}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditCommentContent(e.target.value)}
                          disabled={updateCommentMutation.isPending}
                          className="min-h-24"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => {
                              if (editCommentContent.trim() && user) {
                                updateCommentMutation.mutate({ 
                                  id: c.id, 
                                  userId: user.id, 
                                  content: editCommentContent 
                                });
                              }
                            }}
                            disabled={updateCommentMutation.isPending || !editCommentContent.trim()}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            disabled={updateCommentMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm leading-relaxed">{c.content}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>Consensus:</span>
                            <Badge variant={c.consensusScore && c.consensusScore > 0 ? "default" : "secondary"}>
                              {c.consensusScore !== null ? c.consensusScore.toFixed(2) : 'N/A'}
                            </Badge>
                          </div>
                          {c.clusterLabel && (
                            <div className="flex items-center gap-1">
                              <span>Topic:</span>
                              <Badge variant="outline">{c.clusterLabel}</Badge>
                            </div>
                          )}
                          <span>Posted: {new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {user && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={voteMutation.isPending}
                                onClick={() => user && voteMutation.mutate({ commentId: c.id, userId: user.id, value: 1 })}
                                className="h-8"
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Agree
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={voteMutation.isPending}
                                onClick={() => user && voteMutation.mutate({ commentId: c.id, userId: user.id, value: -1 })}
                                className="h-8"
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Disagree
                              </Button>
                              {c.userId === user.id && (
                                <>
                                  <Separator orientation="vertical" className="h-6" />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditComment(c.id, c.content)}
                                    className="h-8"
                                  >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="h-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {voteMutation.isError && (
                      <div className="text-destructive text-xs mt-2">
                        Error submitting vote: {(voteMutation.error as Error)?.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 