import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotesProvider } from '@/contexts/NotesContext';
import { LoginPage } from '@/components/LoginPage';
import { MainApp } from '@/components/MainApp';

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

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
