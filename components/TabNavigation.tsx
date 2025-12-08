'use client';

import React from 'react';
import { MessageCircle, FileText } from 'lucide-react';

type Tab = 'chat' | 'notes';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50">
      <button
        onClick={() => onTabChange('chat')}
        className={`
          flex flex-col items-center gap-1 py-2 px-6 rounded-lg transition-colors
          ${activeTab === 'chat' 
            ? 'text-primary' 
            : 'text-muted-foreground hover:text-foreground'}
        `}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs font-medium">Chat</span>
      </button>
      
      <button
        onClick={() => onTabChange('notes')}
        className={`
          flex flex-col items-center gap-1 py-2 px-6 rounded-lg transition-colors
          ${activeTab === 'notes' 
            ? 'text-primary' 
            : 'text-muted-foreground hover:text-foreground'}
        `}
      >
        <FileText className="w-5 h-5" />
        <span className="text-xs font-medium">Notes</span>
      </button>
    </nav>
  );
}
