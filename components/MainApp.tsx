'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { TabNavigation } from './TabNavigation';
import { ChatView } from './ChatView';
import { NotesView } from './NotesView';

type Tab = 'chat' | 'notes';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="h-full bg-background">
      <Header />
      
      {activeTab === 'chat' ? <ChatView /> : <NotesView />}
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
