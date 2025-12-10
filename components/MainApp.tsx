'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { TabNavigation } from './TabNavigation';
import { ChatView } from './ChatView';
import { NotesView } from './NotesView';
import { ConversationsSidebar } from './ConversationsSidebar';
import { useConversations } from './contexts/ConversationsContext';

type Tab = 'chat' | 'notes';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setCurrentConversationId, clearCurrentConversation } = useConversations();

  const handleSaveToggle = () => {
    setSaveEnabled(!saveEnabled);
  };

  const handleHistoryClick = () => {
    setSidebarOpen(true);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSidebarOpen(false);
    setCurrentConversationId(conversationId);
    setSaveEnabled(true); // Auto-enable save when loading a saved conversation
  };

  const handleNewConversation = () => {
    setSidebarOpen(false);
    clearCurrentConversation();
    setSaveEnabled(false);
  };

  return (
    <div className="h-full bg-background">
      <Header 
        activeTab={activeTab}
        saveEnabled={saveEnabled}
        onSaveToggle={handleSaveToggle}
        onHistoryClick={handleHistoryClick}
      />
      
      {activeTab === 'chat' ? (
        <ChatView 
          saveEnabled={saveEnabled}
          onSelectConversation={handleSelectConversation}
        />
      ) : (
        <NotesView />
      )}
      
      <ConversationsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

