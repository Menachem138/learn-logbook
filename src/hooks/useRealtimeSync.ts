import { useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { realtimeSync } from '../services/RealtimeSyncService';

export function useRealtimeSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Subscribe to user-specific data when logged in
      realtimeSync.subscribeToUserSpecificData(user.id);

      // Add event listeners for real-time updates
      const handleCourseProgress = (event: CustomEvent) => {
        console.log('Course progress updated:', event.detail);
        // Update local state or trigger a refresh
      };

      const handleJournalEntry = (event: CustomEvent) => {
        console.log('Journal entry updated:', event.detail);
        // Update local state or trigger a refresh
      };

      const handleDocument = (event: CustomEvent) => {
        console.log('Document updated:', event.detail);
        // Update local state or trigger a refresh
      };

      // Add event listeners
      window.addEventListener('courseProgressUpdate', handleCourseProgress as EventListener);
      window.addEventListener('journalEntryUpdate', handleJournalEntry as EventListener);
      window.addEventListener('documentUpdate', handleDocument as EventListener);

      return () => {
        // Cleanup subscriptions and event listeners when component unmounts or user logs out
        realtimeSync.unsubscribeFromAll();
        window.removeEventListener('courseProgressUpdate', handleCourseProgress as EventListener);
        window.removeEventListener('journalEntryUpdate', handleJournalEntry as EventListener);
        window.removeEventListener('documentUpdate', handleDocument as EventListener);
      };
    }
  }, [user]);
}
