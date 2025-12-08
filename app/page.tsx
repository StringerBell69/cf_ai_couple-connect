'use client';

import { AuthProvider, useAuth } from '@/components/contexts/AuthContext';
import { NotesProvider } from '@/components/contexts/NotesContext';
import { LoginPage } from '@/components/LoginPage';
import { MainApp } from '@/components/MainApp';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { InstallPrompt } from '@/components/InstallPrompt';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <NotesProvider>
      <MainApp />
    </NotesProvider>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
      <InstallPrompt />
      <Toaster />
      <Sonner />
    </AuthProvider>
  );
}
