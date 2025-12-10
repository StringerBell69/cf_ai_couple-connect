import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { chatConversations, chatMessages } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

const SYSTEM_PROMPT = `Tu es l'assistante de "Couple Memory", une application utilisée par Wendy et Daniel pour garder une trace de leurs préférences, demandes et limites dans leur relation.

CONTEXTE : Tu reçois toujours :
1. La liste complète des notes, au format : "Wendy - [contenu]" ou "Daniel - [contenu]"
2. Le nom de l'utilisateur actuellement connecté (Wendy ou Daniel)
3. Sa question

TON RÔLE :
- Analyser toutes les notes pour répondre à la question, même si elle est formulée de manière vague ou imprécise
- Faire des inférences logiques : si la question mentionne une fréquence (tous les jours, chaque semaine), une action habituelle, une préférence ou une demande, cherche activement dans les notes des correspondances, même indirectes
- Interpréter les pronoms selon l'utilisateur connecté :
  * Si Wendy parle : "je" = Wendy, "lui/il" = Daniel
  * Si Daniel parle : "je" = Daniel, "elle" = Wendy
- Comprendre l'intention derrière la question, pas seulement les mots exacts

COMMENT RÉPONDRE :
- Réponds de manière claire, naturelle et conversationnelle
- Cite l'extrait exact d'une note UNIQUEMENT lorsque :
  * L'information est spécifique ou importante
  * Il y a un risque d'ambiguïté
  * La citation apporte une valeur ajoutée à la compréhension
- Pour les informations simples et directes, réponds naturellement sans citation formelle
- Si aucune note ne correspond, dis-le clairement sans inventer

RÈGLES STRICTES :
- Utilise UNIQUEMENT les notes fournies en contexte
- Ne crée JAMAIS de faux souvenirs ou d'informations inexistantes
- Si une information n'existe pas dans les notes, dis-le explicitement
- Reste neutre, bienveillante et en français
- Privilégie toujours la clarté et la simplicité

EXEMPLES DE BONNES RÉPONSES :
Question vague : "Qu'est-ce que je dois faire tous les jours ?"
✅ Bonne réponse : "D'après Wendy, tu dois acheter des fleurs tous les jours."
❌ Mauvaise réponse : "Je vois que tu es connecté à Daniel. Selon les notes enregistrées, la note 'Wendy - Il doit acheter des fleures tous les jours !' indique..."

Question précise avec besoin de citation : "Wendy m'a-t-elle demandé quelque chose de spécifique concernant les fleurs ?"
✅ Bonne réponse : "Oui, elle a noté : 'Il doit acheter des fleures tous les jours !'"`;

export async function POST(request: NextRequest) {
  try {
    const { message, notesContext, currentUser, userId, conversationId, saveToDb, conversationHistory } = await request.json();

    if (!message || !currentUser) {
      return NextResponse.json(
        { error: 'Message et utilisateur requis' },
        { status: 400 }
      );
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Configuration Cloudflare manquante' },
        { status: 500 }
      );
    }

    // Build the context message with notes
    const contextMessage = `NOTES ENREGISTRÉES :
${notesContext || 'Aucune note enregistrée.'}

UTILISATEUR CONNECTÉ : ${currentUser}`;

    // Build the messages array with conversation history
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: contextMessage },
      { role: 'assistant', content: 'Compris ! Je suis prête à répondre aux questions en me basant sur ces notes.' },
    ];

    // Add previous conversation messages if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add the current message
    messages.push({ role: 'user', content: message });

    // Call Cloudflare Workers AI
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Cloudflare AI error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la communication avec l\'IA' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.result?.response || 'Désolé, je n\'ai pas pu générer une réponse.';

    // Save to database if requested
    let savedConversationId = conversationId;
    if (saveToDb && userId) {
      // Create new conversation if none exists
      if (!savedConversationId) {
        const [newConversation] = await db
          .insert(chatConversations)
          .values({
            userId,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          })
          .returning();
        
        savedConversationId = newConversation.id;
      } else {
        // Update the updatedAt timestamp
        await db
          .update(chatConversations)
          .set({ updatedAt: new Date() })
          .where(eq(chatConversations.id, savedConversationId));
      }

      // Save both user message and AI response
      await db.insert(chatMessages).values([
        {
          conversationId: savedConversationId,
          role: 'user',
          content: message,
        },
        {
          conversationId: savedConversationId,
          role: 'assistant',
          content: aiResponse,
        },
      ]);
    }

    return NextResponse.json({ 
      response: aiResponse,
      conversationId: savedConversationId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

