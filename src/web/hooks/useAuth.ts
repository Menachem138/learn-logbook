import { useContext } from 'react';
import { AuthContext } from '@/hooks/auth-context';

export const useAuth = () => {
  return useContext(AuthContext);
};
