import { cn } from "@/lib/utils";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const TabButton = ({ active, onClick, children, icon }: TabButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2",
        "hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30",
        active
          ? "glass-strong text-foreground shadow-glass-sm"
          : "text-foreground/70 hover:text-foreground"
      )}
    >
      {icon}
      {children}
    </button>
  );
};

export default TabButton;
