import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { users, sessions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

// Demo passwords - will be replaced with hashed passwords in database
const DEMO_PASSWORDS: Record<string, string> = {
  Wendy: 'wendy123',
  Daniel: 'daniel123',
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    // Validate username is Wendy or Daniel
    if (username !== 'Wendy' && username !== 'Daniel') {
      return NextResponse.json(
        { error: 'Utilisateur invalide' },
        { status: 400 }
      );
    }

    // Check if user exists in database
    let user = await db
      .select()
      .from(users)
      .where(eq(users.name, username))
      .limit(1);

    // If user doesn't exist, create them with demo password (for initial setup)
    if (user.length === 0) {
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORDS[username], 10);
      const newUser = await db
        .insert(users)
        .values({
          name: username,
          passwordHash: hashedPassword,
        })
        .returning();
      user = newUser;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user[0].passwordHash);
    
    // Also allow demo passwords for convenience
    const isDemoPassword = DEMO_PASSWORDS[username] === password;
    
    if (!isValidPassword && !isDemoPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const session = await db
      .insert(sessions)
      .values({
        userId: user[0].id,
        expiresAt,
      })
      .returning();

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set('session_id', session[0].id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });
    cookieStore.set('user_name', username, {
      httpOnly: false, // Accessible to JavaScript for UI
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });
    cookieStore.set('user_id', user[0].id, {
      httpOnly: false, // Accessible to JavaScript for conversations
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user[0].id,
        name: user[0].name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
