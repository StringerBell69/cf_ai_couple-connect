import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { notes, users } from '@/src/db/schema';
import { eq, desc, or, isNull, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Helper to get current user from session
async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  if (!sessionId) return null;
  
  // For demo purposes, we'll use a simple cookie-based auth
  // In production, you'd verify the session in the database
  const userName = cookieStore.get('user_name')?.value;
  return userName;
}

// GET /api/notes - Fetch all active (non-expired) notes
export async function GET() {
  try {
    const now = new Date();
    
    // Fetch notes that haven't expired (expiresAt is null OR expiresAt > now)
    const allNotes = await db
      .select()
      .from(notes)
      .where(
        or(
          isNull(notes.expiresAt),
          gt(notes.expiresAt, now)
        )
      )
      .orderBy(desc(notes.createdAt));

    return NextResponse.json({ notes: allNotes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const userName = await getCurrentUser();
    
    if (!userName) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { content, expiresAt } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Contenu requis' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.name, userName))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const newNote = await db
      .insert(notes)
      .values({
        authorId: user[0].id,
        authorName: userName,
        content: content.trim(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json({ note: newNote[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la note' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes - Delete a note
export async function DELETE(request: NextRequest) {
  try {
    const userName = await getCurrentUser();
    
    if (!userName) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json(
        { error: 'ID de note requis' },
        { status: 400 }
      );
    }

    // Verify the note belongs to the current user
    const noteToDelete = await db
      .select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1);

    if (noteToDelete.length === 0) {
      return NextResponse.json(
        { error: 'Note non trouvée' },
        { status: 404 }
      );
    }

    if (noteToDelete[0].authorName !== userName) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer cette note' },
        { status: 403 }
      );
    }

    await db.delete(notes).where(eq(notes.id, noteId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la note' },
      { status: 500 }
    );
  }
}
