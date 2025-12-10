'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { useNotes } from '@/components/contexts/NotesContext';
import { useConversations } from '@/components/contexts/ConversationsContext';
import { Send, Sparkles, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatViewProps {
  saveEnabled: boolean;
  onSelectConversation: (conversationId: string) => void;
}

export function ChatView({ saveEnabled, onSelectConversation }: ChatViewProps) {
  const { user } = useAuth();
  const { getFormattedContext } = useNotes();
  const { 
    currentConversationId, 
    setCurrentConversationId, 
    loadConversations, 
    loadConversation,
  } = useConversations();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get userId from cookie
  useEffect(() => {
    const userIdCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_id='))
      ?.split('=')[1];
    
    if (userIdCookie) {
      setUserId(userIdCookie);
      loadConversations();
    }
  }, [loadConversations]);

  // Load messages when conversation is selected externally
  useEffect(() => {
    const loadCurrentConversation = async () => {
      if (currentConversationId) {
        const loadedMessages = await loadConversation(currentConversationId);
        setMessages(loadedMessages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        })));
      } else {
        setMessages([]);
      }
    };
    loadCurrentConversation();
  }, [currentConversationId, loadConversation]);

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

    try {
      const notesContext = getFormattedContext();
      
      // Build conversation history for AI context (exclude the current message being sent)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          notesContext,
          currentUser: user,
          userId: saveEnabled ? userId : undefined,
          conversationId: saveEnabled ? currentConversationId : undefined,
          saveToDb: saveEnabled,
          conversationHistory,
        }),
      });

      const data = await response.json();
      
      // Update conversation ID if a new one was created
      if (saveEnabled && data.conversationId) {
        setCurrentConversationId(data.conversationId);
        // Refresh conversations list
        loadConversations();
      }
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || data.error || 'Désolé, une erreur est survenue.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Désolé, je n\'ai pas pu me connecter au serveur.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
            {saveEnabled && (
              <p className="text-xs text-primary mt-3 flex items-center gap-1">
                <Save className="w-3 h-3" />
                Cette conversation sera sauvegardée
              </p>
            )}
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

