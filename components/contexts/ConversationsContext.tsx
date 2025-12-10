'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatConversation, ChatMessage } from '@/src/db/schema';

interface ConversationsContextType {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  isLoadingConversations: boolean;
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<ChatMessage[]>;
  setCurrentConversationId: (id: string | null) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearCurrentConversation: () => void;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch('/api/conversations');

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const loadConversation = useCallback(async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        return data.messages || [];
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
    return [];
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [currentConversationId]);

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        currentConversationId,
        isLoadingConversations,
        loadConversations,
        loadConversation,
        setCurrentConversationId,
        deleteConversation,
        clearCurrentConversation,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
}
