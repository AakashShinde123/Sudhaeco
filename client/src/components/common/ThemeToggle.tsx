import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <div className="flex items-center">
      <Switch
        id="dark-mode-toggle"
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        className="w-10 h-5"
      />
      <span className="sr-only">Dark mode</span>
      <Sun className="ml-1 h-4 w-4 dark:hidden" />
      <Moon className="ml-1 h-4 w-4 hidden dark:block" />
    </div>
  );
}
