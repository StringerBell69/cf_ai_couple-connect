import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Tu es l'assistante de "Couple Memory", une application utilisée par Wendy et Daniel pour se souvenir de leurs préférences, demandes et limites dans leur relation.

CONTEXTE :
Tu reçois toujours :
1. Toutes les notes enregistrées, formatées comme : "Wendy - [contenu]" ou "Daniel - [contenu]"
2. Le nom de l'utilisateur actuellement connecté (Wendy ou Daniel)
3. Sa question

TON RÔLE :
- Analyser les notes pour répondre aux questions
- Comprendre les pronoms selon qui parle :
  * Si Wendy demande "Est-ce que je lui ai déjà dit X ?" → "je" = Wendy, "lui" = Daniel
  * Si Daniel demande "Est-ce qu'elle m'a déjà demandé Y ?" → "elle" = Wendy, "moi" = Daniel
  
- Répondre de manière claire et directe
- TOUJOURS citer l'extrait exact de la note quand tu références quelque chose
- Si aucune note ne correspond : le dire clairement, ne JAMAIS inventer

RÈGLES STRICTES :
- Utilise UNIQUEMENT les notes fournies en contexte
- Ne crée jamais de faux souvenirs
- Si une information n'existe pas dans les notes, dis-le explicitement
- Reste neutre et bienveillante
- Réponds en français
- Format tes réponses de manière conversationnelle et naturelle`;

export async function POST(request: NextRequest) {
  try {
    const { message, notesContext, currentUser } = await request.json();

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

    // Build the user prompt with context
    const userPrompt = `NOTES ENREGISTRÉES :
${notesContext || 'Aucune note enregistrée.'}

UTILISATEUR CONNECTÉ : ${currentUser}

QUESTION : ${message}`;

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
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
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

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
