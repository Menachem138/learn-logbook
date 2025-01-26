import { StudyTimer } from '../components/StudyTimer';
import Library from '../components/Library';
import { Calendar } from '../components/Calendar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <StudyTimer />
      <div className="w-full max-w-7xl mt-8">
        <Calendar />
        <Library />
      </div>
    </main>
  );
}
