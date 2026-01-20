import { Quote } from "lucide-react";

const QuoteCard = () => {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-pastel flex items-center justify-center flex-shrink-0">
          <Quote className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-medium italic text-foreground/90 mb-2">
            "Work hard and get things sorted"
          </p>
          <p className="text-sm text-primary font-semibold">— SCR</p>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
