import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all ${theme === 'dark' ? 'hidden' : 'block'}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] rotate-90 transition-all ${theme === 'dark' ? 'block' : 'hidden'}`} />
      <span className="sr-only">החלף מצב תצוגה</span>
    </Button>
  );
}