import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, Send, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIDoubtSolverProps {
  onTimeUpdate: (minutes: number) => void;
  totalTimeUsed: number;
}

const MAX_AI_TIME_MINUTES = 15;

// Placeholder for Gemini API key - add your key from ai.google.dev
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

const SYSTEM_PROMPT = `You are a strict study assistant for NEET preparation. You ONLY answer:
- Chemistry questions (Organic, Inorganic, Physical)
- Biology questions (Botany, Zoology, Human Physiology)
- Physics questions (Mechanics, Thermodynamics, Electromagnetism, Optics, Modern Physics)
- NCERT-related doubts

For ANY off-topic question (casual chat, entertainment, general knowledge unrelated to NEET, etc.), respond with:
"I can only help with NEET-related study doubts. Please ask about Chemistry, Biology, or Physics."

Keep answers concise, focused, and educational. Use bullet points when explaining concepts.`;

const AIDoubtSolver = ({ onTimeUpdate, totalTimeUsed }: AIDoubtSolverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);

  const timeRemaining = MAX_AI_TIME_MINUTES - totalTimeUsed;
  const isTimeLimitReached = timeRemaining <= 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
    
    if (!isOpen && startTimeRef.current) {
      const minutesUsed = (Date.now() - startTimeRef.current) / 60000;
      onTimeUpdate(minutesUsed);
      startTimeRef.current = null;
    }
  }, [isOpen, onTimeUpdate]);

  const sendMessage = async () => {
    if (!input.trim() || loading || isTimeLimitReached) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check if API key is configured
      if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ AI not configured. To enable:\n\n1. Get free API key from ai.google.dev\n2. Replace YOUR_GEMINI_API_KEY_HERE in AIDoubtSolver.tsx\n3. Refresh the app'
        }]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
              { role: 'model', parts: [{ text: 'Understood. I will only answer NEET-related study questions.' }] },
              ...messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
              })),
              { role: 'user', parts: [{ text: input }] }
            ]
          })
        }
      );

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'Sorry, I couldn\'t process that. Please try again.';

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error connecting to AI. Please check your internet connection.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
          "bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-110",
          isTimeLimitReached && "opacity-50 cursor-not-allowed"
        )}
        disabled={isTimeLimitReached}
      >
        <HelpCircle className="w-7 h-7 text-white" />
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full sm:w-[40%] sm:max-w-md z-50 bg-black border-l border-zinc-800 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">AI Doubt Solver</h3>
              <p className="text-xs text-zinc-400">NEET questions only</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Time warning */}
        <div className={cn(
          "p-3 flex items-center gap-2 text-sm",
          timeRemaining <= 5 ? "bg-red-500/20 text-red-300" : "bg-zinc-900 text-zinc-400"
        )}>
          <Clock className="w-4 h-4" />
          {isTimeLimitReached ? (
            <span>Time limit reached. Focus on studying!</span>
          ) : (
            <span>{Math.ceil(timeRemaining)} minutes remaining</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 180px)' }}>
          {messages.length === 0 && (
            <div className="text-center text-zinc-500 py-8">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ask your NEET-related doubts here.</p>
              <p className="text-xs mt-2">Chemistry, Biology, Physics only.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-xl max-w-[85%]",
                msg.role === 'user' 
                  ? "bg-pink-500/20 ml-auto text-white" 
                  : "bg-zinc-800 text-zinc-200"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          
          {loading && (
            <div className="bg-zinc-800 p-3 rounded-xl max-w-[85%]">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce delay-200" />
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-black">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isTimeLimitReached ? "Time limit reached" : "Ask your doubt..."}
              disabled={loading || isTimeLimitReached}
              className="flex-1 bg-zinc-900 border-zinc-700 text-white"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading || isTimeLimitReached}
              className="bg-gradient-to-r from-pink-500 to-purple-500"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AIDoubtSolver;
