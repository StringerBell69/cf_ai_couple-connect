import React from 'react';
import { MessageCircle, FileText } from 'lucide-react';

type Tab = 'chat' | 'notes';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        <button
          onClick={() => onTabChange('chat')}
          className={`
            flex flex-col items-center justify-center flex-1 h-full gap-1
            transition-colors duration-200
            ${activeTab === 'chat' 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'}
          `}
        >
          <MessageCircle 
            className={`w-6 h-6 ${activeTab === 'chat' ? 'fill-primary/20' : ''}`} 
          />
          <span className="text-xs font-medium">Chat</span>
        </button>

        <button
          onClick={() => onTabChange('notes')}
          className={`
            flex flex-col items-center justify-center flex-1 h-full gap-1
            transition-colors duration-200
            ${activeTab === 'notes' 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'}
          `}
        >
          <FileText 
            className={`w-6 h-6 ${activeTab === 'notes' ? 'fill-primary/20' : ''}`} 
          />
          <span className="text-xs font-medium">Notes</span>
        </button>
      </div>
    </nav>
  );
}
