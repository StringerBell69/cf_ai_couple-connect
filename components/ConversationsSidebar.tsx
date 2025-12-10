'use client';

import React, { useState } from 'react';
import { History, Trash2, MessageSquare, ChevronRight, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConversations } from '@/components/contexts/ConversationsContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConversationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ConversationsSidebar({
  isOpen,
  onClose,
  onSelectConversation,
  onNewConversation,
}: ConversationsSidebarProps) {
  const { conversations, currentConversationId, deleteConversation, isLoadingConversations } = useConversations();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setDeletingId(conversationId);
    await deleteConversation(conversationId);
    setDeletingId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-80 bg-card border-r border-border z-50 flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New conversation button */}
        <div className="p-3 border-b border-border">
          <Button
            onClick={onNewConversation}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle conversation
          </Button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm px-4 text-center">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p>Aucune conversation sauvegardée</p>
              <p className="text-xs mt-1">Active le mode sauvegarde pour garder une conversation</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    group flex items-center gap-3 p-3 rounded-lg cursor-pointer
                    transition-colors duration-200
                    ${currentConversationId === conversation.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'}
                  `}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation.title || 'Sans titre'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conversation.updatedAt), 'd MMM, HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(e, conversation.id)}
                      disabled={deletingId === conversation.id}
                    >
                      {deletingId === conversation.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
