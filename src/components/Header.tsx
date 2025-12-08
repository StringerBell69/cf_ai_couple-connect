import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Heart } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-b border-border z-50">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" fill="currentColor" />
          <span className="font-semibold text-foreground">Couple Memory</span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${user === 'Wendy' 
              ? 'bg-wendy-light text-wendy' 
              : 'bg-daniel-light text-daniel'}
          `}>
            {user}
          </div>
          
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
