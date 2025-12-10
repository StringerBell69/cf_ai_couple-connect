'use client';

import React from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { Heart, LogOut, History, Save, SaveOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeTab?: 'chat' | 'notes';
  saveEnabled?: boolean;
  onSaveToggle?: () => void;
  onHistoryClick?: () => void;
}

export function Header({ activeTab, saveEnabled, onSaveToggle, onHistoryClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-2">
        {activeTab === 'chat' && onHistoryClick ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onHistoryClick}
            className="h-8 w-8"
            title="Historique des conversations"
          >
            <History className="w-4 h-4" />
          </Button>
        ) : (
          <Heart className="w-5 h-5 text-primary" fill="currentColor" />
        )}
        <span className="font-semibold text-foreground">Couple Memory</span>
      </div>
      
      <div className="flex items-center gap-2">
        {activeTab === 'chat' && onSaveToggle && (
          <>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {saveEnabled ? 'Sauvegarde' : 'Éphémère'}
            </span>
            <Button
              variant={saveEnabled ? 'default' : 'outline'}
              size="icon"
              onClick={onSaveToggle}
              className="h-8 w-8"
              title={saveEnabled ? 'Désactiver la sauvegarde' : 'Activer la sauvegarde'}
            >
              {saveEnabled ? (
                <Save className="w-4 h-4" />
              ) : (
                <SaveOff className="w-4 h-4" />
              )}
            </Button>
          </>
        )}
        <span className="text-sm text-muted-foreground">{user}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={logout}
          className="h-8 w-8"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

