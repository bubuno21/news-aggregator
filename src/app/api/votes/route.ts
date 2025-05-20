import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';

const VoteSchema = z.object({
  userId: z.string().uuid(),
  commentId: z.string().uuid(),
  value: z.number().int().refine((v) => v === 1 || v === -1, {
    message: 'Value must be 1 (Helpful/Agree) or -1 (Not Helpful/Disagree)',
  }),
});

// Helper function to validate UUID format
function isValidUUID(str: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    
    // Check if the user already has a vote on this comment
    const { data: existingVote, error: findError } = await supabase
      .from('Vote')
      .select('*')
      .eq('userId', parsed.data.userId)
      .eq('commentId', parsed.data.commentId)
      .maybeSingle();
      
    if (findError) throw new Error(findError.message);
    
    // If the vote exists with the same value, remove it (toggle off)
    if (existingVote && existingVote.value === parsed.data.value) {
      const { error: deleteError } = await supabase
        .from('Vote')
        .delete()
        .eq('id', existingVote.id);
        
      if (deleteError) throw new Error(deleteError.message);
      return NextResponse.json({ success: true, action: 'removed' }, { status: 200 });
    } 
    // If the vote exists with a different value, update it (change vote direction)
    else if (existingVote) {
      const { data: updatedVote, error: updateError } = await supabase
        .from('Vote')
        .update({ value: parsed.data.value })
        .eq('id', existingVote.id)
        .select('*')
        .single();
        
      if (updateError) throw new Error(updateError.message);
      return NextResponse.json({ vote: updatedVote, action: 'updated' }, { status: 200 });
    } 
    // If no existing vote, create a new one
    else {
      const { data: newVote, error: insertError } = await supabase
        .from('Vote')
        .insert([parsed.data])
        .select('*')
        .single();
        
      if (insertError) throw new Error(insertError.message);
      return NextResponse.json({ vote: newVote, action: 'created' }, { status: 201 });
    }
  } catch (err: any) {
    console.error('API /votes POST error:', err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const commentId = searchParams.get('commentId');
    
    if (!userId || !commentId || !isValidUUID(userId) || !isValidUUID(commentId)) {
      return NextResponse.json({ error: 'Invalid or missing userId/commentId' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('Vote')
      .delete()
      .eq('userId', userId)
      .eq('commentId', commentId);
      
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API /votes DELETE error:', err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 