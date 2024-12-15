import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YouTubeLibrary from '@/components/YouTubeLibrary';

// Create a client
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

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
            <Route
              path="/youtube"
              element={
                <ProtectedRoute>
                  <YouTubeLibrary />
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
