import { Checkbox } from "@/components/ui/checkbox";

interface LessonItemProps {
  title: string;
  duration: string;
  isCompleted: boolean;
  onToggle: () => void;
}

export function LessonItem({ title, duration, isCompleted, onToggle }: LessonItemProps) {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onToggle}
        />
        <label className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
          {title}
        </label>
      </div>
      <span className="text-sm text-muted-foreground">
        {duration.replace(/^00:/, "")}
      </span>
    </li>
  );
}