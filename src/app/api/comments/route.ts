import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';

const CommentSchema = z.object({
  userId: z.string().uuid(),
  storyId: z.string().uuid(),
  content: z.string().min(1),
});

const UpdateCommentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(), // For verification
  content: z.string().min(1),
});

// Helper function to validate UUID format
function isValidUUID(str: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('storyId');
    
    // If storyId is missing, return 400 error
    if (!storyId) {
      return NextResponse.json({ error: 'Missing storyId query param' }, { status: 400 });
    }
    
    // If storyId is '(feed)' or not a valid UUID, return empty array
    if (storyId === '(feed)' || !isValidUUID(storyId)) {
      console.log(`Invalid storyId format: ${storyId}, returning empty comments array`);
      return NextResponse.json({ comments: [] }, { status: 200 });
    }
    
    // Fetch comments for valid storyId
    const { data, error } = await supabase
      .from('Comment')
      .select('*')
      .eq('storyId', storyId)
      .order('createdAt', { ascending: false });
      
    if (error) throw new Error(error.message);
    return NextResponse.json({ comments: data }, { status: 200 });
  } catch (err: any) {
    console.error('API /comments GET error:', err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('Comment')
      .insert([parsed.data])
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (err: any) {
    console.error('API /comments POST error:', err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    
    // Verify the user owns this comment
    const { data: existingComment, error: findError } = await supabase
      .from('Comment')
      .select('*')
      .eq('id', parsed.data.id)
      .single();
      
    if (findError) throw new Error(findError.message);
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (existingComment.userId !== parsed.data.userId) {
      return NextResponse.json({ error: 'Unauthorized: You can only edit your own comments' }, { status: 403 });
    }
    
    // Update the comment
    const { data, error } = await supabase
      .from('Comment')
      .update({ content: parsed.data.content })
      .eq('id', parsed.data.id)
      .select('*')
      .single();
      
    if (error) throw new Error(error.message);
    return NextResponse.json({ comment: data }, { status: 200 });
  } catch (err: any) {
    console.error('API /comments PATCH error:', err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!commentId || !userId || !isValidUUID(commentId) || !isValidUUID(userId)) {
      return NextResponse.json({ error: 'Invalid or missing id/userId' }, { status: 400 });
    }
    
    // Verify the user owns this comment
    const { data: existingComment, error: findError } = await supabase
      .from('Comment')
      .select('*')
      .eq('id', commentId)
      .single();
      
    if (findError) throw new Error(findError.message);
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (existingComment.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: You can only delete your own comments' }, { status: 403 });
    }
    
    // Delete the comment
    const { error } = await supabase
      .from('Comment')
      .delete()
      .eq('id', commentId);
      
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API /comments DELETE error:', err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 