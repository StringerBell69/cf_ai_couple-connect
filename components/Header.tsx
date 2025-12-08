'use client';

import React from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary" fill="currentColor" />
        <span className="font-semibold text-foreground">Couple Memory</span>
      </div>
      
      <div className="flex items-center gap-2">
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
