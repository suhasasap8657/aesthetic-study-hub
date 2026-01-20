import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const quotes = [
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
];

const QuoteCard = () => {
  const [quote, setQuote] = useState(quotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  const getNewQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div
      className="glass-card rounded-2xl p-6 cursor-pointer hover:shadow-glow transition-all duration-500 animate-fade-in"
      onClick={getNewQuote}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-pastel flex items-center justify-center flex-shrink-0 animate-float">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-foreground font-medium italic leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-muted-foreground text-sm mt-2">— {quote.author}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">Click for a new quote ✨</p>
    </div>
  );
};

export default QuoteCard;
