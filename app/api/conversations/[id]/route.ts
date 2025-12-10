import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { chatMessages } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

// GET - Retrieve all messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

