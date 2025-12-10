import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { chatConversations, chatMessages } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Retrieve all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    const userId = request.cookies.get('user_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
    }

    const conversations = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.updatedAt));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    );
  }
}

// POST - Create a new conversation or save messages to existing one
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { conversationId, userId, title, messages } = await request.json();

    let convId = conversationId;

    // Create new conversation if no ID provided
    if (!convId) {
      const [newConversation] = await db
        .insert(chatConversations)
        .values({
          userId,
          title: title || 'Nouvelle conversation',
        })
        .returning();
      
      convId = newConversation.id;
    } else {
      // Update the updatedAt timestamp
      await db
        .update(chatConversations)
        .set({ updatedAt: new Date() })
        .where(eq(chatConversations.id, convId));
    }

    // Save messages if provided
    if (messages && messages.length > 0) {
      await db.insert(chatMessages).values(
        messages.map((msg: { role: string; content: string }) => ({
          conversationId: convId,
          role: msg.role,
          content: msg.content,
        }))
      );
    }

    return NextResponse.json({ conversationId: convId });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la conversation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a conversation
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversation manquant' },
        { status: 400 }
      );
    }

    await db
      .delete(chatConversations)
      .where(eq(chatConversations.id, conversationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la conversation' },
      { status: 500 }
    );
  }
}
