import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import { ChatMessage } from '@/types';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

export function ChatView() {
  const { user } = useAuth();
  const { getFormattedContext } = useNotes();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (will be replaced with Lovable AI)
    setTimeout(() => {
      const context = getFormattedContext();
      
      // Demo response based on context
      let aiResponse = '';
      const lowercaseInput = input.toLowerCase();
      
      if (lowercaseInput.includes('balade') || lowercaseInput.includes('dimanche')) {
        aiResponse = `Oui ! J'ai trouvé une note de Wendy qui dit : "J'aimerais qu'on fasse plus de balades le dimanche matin". Elle a été ajoutée le 15 janvier 2024.`;
      } else if (lowercaseInput.includes('vaisselle')) {
        aiResponse = `J'ai trouvé une note de Wendy à ce sujet : "Je n'aime pas quand la vaisselle traîne plus d'une journée". Cette note date du 5 février 2024.`;
      } else if (lowercaseInput.includes('invité') || lowercaseInput.includes('prévenir')) {
        aiResponse = `Oui, Daniel a mentionné : "Je préfère qu'on me prévienne à l'avance quand on a des invités" (note du 20 janvier 2024).`;
      } else if (lowercaseInput.includes('mot') && lowercaseInput.includes('doux')) {
        aiResponse = `Daniel a noté : "J'apprécie quand tu me fais des petits mots doux le matin" (10 février 2024). C'est une belle attention qu'il apprécie ! 💕`;
      } else {
        aiResponse = `Je n'ai pas trouvé de note correspondant exactement à ta question. Voici les sujets que j'ai en mémoire : balades du dimanche, vaisselle, invités, et petits mots doux. Tu veux que je cherche autre chose ?`;
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full pt-14 pb-20">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Salut {user} ! 👋
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Pose-moi une question sur vos notes. Par exemple : "Est-ce que je lui ai déjà parlé de..." ou "Qu'est-ce qu'il/elle m'a dit sur..."
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`
                  max-w-[85%] px-4 py-3 rounded-2xl
                  ${message.role === 'user'
                    ? 'bg-bubble-user text-bubble-user-foreground rounded-br-md'
                    : 'bg-bubble-ai text-bubble-ai-foreground rounded-bl-md'}
                `}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-bubble-user-foreground/70' : 'text-muted-foreground'}`}>
                  {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-bubble-ai text-bubble-ai-foreground px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSubmit}
        className="fixed bottom-16 left-0 right-0 bg-card border-t border-border px-4 py-3"
      >
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose une question..."
            className="min-h-[44px] max-h-32 resize-none bg-muted border-0 rounded-xl px-4 py-3"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
