'use client';

import React, { useState, useEffect } from 'react';
import { X, Share, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (running in standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check if prompt was dismissed before
    const dismissed = localStorage.getItem('installPromptDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if iOS, not standalone, and not recently dismissed (show again after 7 days)
    if (iOS && !standalone && daysSinceDismissed > 7) {
      // Delay showing the prompt for a better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', Date.now().toString());
    setShowPrompt(false);
  };

  const handleShowAgain = () => {
    localStorage.removeItem('installPromptDismissed');
    setShowPrompt(true);
  };

  if (!showPrompt) {
    // Show a small floating button to bring back the prompt
    if (isIOS && !isStandalone) {
      return (
        <button
          onClick={handleShowAgain}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-40 hover:bg-primary/90 transition-colors"
          aria-label="Installer l'application"
        >
          <Smartphone className="w-5 h-5" />
        </button>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-t-3xl p-6 pb-8 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Installer Couple Memory</h3>
              <p className="text-sm text-muted-foreground">Ajouter à l'écran d'accueil</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Installez cette application sur votre iPhone pour un accès rapide et une meilleure expérience.
          </p>

          <div className="bg-muted rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-medium">1</div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Appuyez sur</span>
                <Share className="w-5 h-5 text-primary" />
                <span className="text-sm">dans Safari</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-medium">2</div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Sélectionnez</span>
                <span className="font-medium">"Sur l'écran d'accueil"</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm">Appuyez sur <span className="font-medium">"Ajouter"</span></span>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            variant="outline"
            className="w-full"
          >
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
}
