import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google';

export function GoogleOAuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  
  return (
    <GoogleProvider clientId={clientId}>
      {children}
    </GoogleProvider>
  );
}