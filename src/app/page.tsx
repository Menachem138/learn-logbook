import { StudyTimer } from '@/components/StudyTimer';
import Library from '@/components/Library';
import LearningJournal from '@/components/LearningJournal';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <StudyTimer />
      <div className="w-full max-w-7xl mt-8">
        <Library />
        <div className="mt-8">
          <LearningJournal />
        </div>
      </div>
    </main>
  );
}