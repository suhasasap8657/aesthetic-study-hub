import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  label: string;
  completed: boolean;
}

interface DayAccordionProps {
  date: string;
  day: string;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

const DayAccordion = ({ date, day, tasks, onToggleTask }: DayAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-pastel flex items-center justify-center">
            <span className="text-white font-bold text-sm">{date.split(" ")[1]}</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{date}</p>
            <p className="text-xs text-muted-foreground">{day}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-pastel transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{tasks.length}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 space-y-2">
          {tasks.map((task) => (
            <label
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-white/10",
                task.completed && "bg-secondary/10"
              )}
            >
              <button
                onClick={() => onToggleTask(task.id)}
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300",
                  task.completed
                    ? "bg-secondary border-secondary"
                    : "border-primary/50 bg-white/50"
                )}
              >
                {task.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span
                className={cn(
                  "text-sm transition-all duration-200",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayAccordion;
