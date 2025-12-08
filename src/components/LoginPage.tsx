import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { Heart, Lock, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginPage() {
  const { login } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Choisis qui tu es');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = login(selectedUser, password);
    if (!success) {
      setError('Mot de passe incorrect');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent mb-4">
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Couple Memory</h1>
          <p className="text-muted-foreground text-sm">Votre mémoire de couple</p>
        </div>

        {/* User Selection */}
        <div className="space-y-3 animate-slide-up">
          <p className="text-sm text-muted-foreground text-center">Qui es-tu ?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setSelectedUser('Wendy'); setError(''); }}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center gap-2
                ${selectedUser === 'Wendy' 
                  ? 'border-wendy bg-wendy-light' 
                  : 'border-border hover:border-wendy/50 bg-card'}
              `}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${selectedUser === 'Wendy' ? 'bg-wendy' : 'bg-muted'}
              `}>
                <UserIcon className={`w-6 h-6 ${selectedUser === 'Wendy' ? 'text-wendy-foreground' : 'text-muted-foreground'}`} />
              </div>
              <span className={`font-medium ${selectedUser === 'Wendy' ? 'text-wendy' : 'text-foreground'}`}>
                Wendy
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedUser('Daniel'); setError(''); }}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center gap-2
                ${selectedUser === 'Daniel' 
                  ? 'border-daniel bg-daniel-light' 
                  : 'border-border hover:border-daniel/50 bg-card'}
              `}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${selectedUser === 'Daniel' ? 'bg-daniel' : 'bg-muted'}
              `}>
                <UserIcon className={`w-6 h-6 ${selectedUser === 'Daniel' ? 'text-daniel-foreground' : 'text-muted-foreground'}`} />
              </div>
              <span className={`font-medium ${selectedUser === 'Daniel' ? 'text-daniel' : 'text-foreground'}`}>
                Daniel
              </span>
            </button>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="pl-10 h-12 bg-card border-border"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center animate-fade-in">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading || !selectedUser}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isLoading ? (
              <span className="animate-pulse-soft">Connexion...</span>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        {/* Demo hint */}
        <p className="text-xs text-muted-foreground text-center">
          Demo: wendy123 / daniel123
        </p>
      </div>
    </div>
  );
}
