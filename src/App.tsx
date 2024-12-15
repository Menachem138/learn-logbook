import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Create a client
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      if (!session) {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: import.meta.env.VITE_SUPABASE_USERNAME,
            password: import.meta.env.VITE_SUPABASE_PASSWORD,
          });
          if (error) console.error('Auth error:', error);
        } catch (err) {
          console.error('Auth failed:', err);
        }
      }
    };
    initAuth();
  }, [session]);

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
