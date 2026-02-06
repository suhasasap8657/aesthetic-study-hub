import { useState, useEffect } from 'react';
import { Calendar, Plus, X, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getExams, saveExams, ExamDate } from '@/lib/firebase';

const ExamTracker = () => {
  const [exams, setExams] = useState<ExamDate[]>([]);
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [countdowns, setCountdowns] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({});

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      updateCountdowns();
    }, 1000);

    return () => clearInterval(timer);
  }, [exams]);

  const loadExams = async () => {
    const savedExams = await getExams();
    setExams(savedExams);
  };

  const updateCountdowns = () => {
    const now = new Date().getTime();
    const newCountdowns: Record<string, { days: number; hours: number; minutes: number; seconds: number }> = {};

    exams.forEach(exam => {
      const examTime = new Date(exam.date).getTime();
      const diff = examTime - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        newCountdowns[exam.id] = { days, hours, minutes, seconds };
      } else {
        newCountdowns[exam.id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    });

    setCountdowns(newCountdowns);
  };

  const addExam = async () => {
    if (!newExamName || !newExamDate) return;

    const exam: ExamDate = {
      id: `exam-${Date.now()}`,
      name: newExamName,
      date: newExamDate,
      createdAt: new Date().toISOString()
    };

    const updatedExams = [...exams, exam];
    setExams(updatedExams);
    await saveExams(updatedExams);
    
    setNewExamName('');
    setNewExamDate('');
    setIsOpen(false);
  };

  const removeExam = async (id: string) => {
    const updatedExams = exams.filter(e => e.id !== id);
    setExams(updatedExams);
    await saveExams(updatedExams);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Exam Countdown
        </h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Exam Name</label>
                <Input
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  placeholder="e.g., NEET 2026"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Exam Date</label>
                <Input
                  type="date"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <Button onClick={addExam} className="w-full bg-purple-600 hover:bg-purple-700">
                Add Exam
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {exams.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <p className="text-zinc-500">No exams added yet</p>
          <p className="text-sm text-zinc-600 mt-1">Click "Add Exam" to start tracking</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {exams.map(exam => {
            const countdown = countdowns[exam.id];
            return (
              <Card key={exam.id} className="bg-zinc-900 border-zinc-800 p-4 relative group">
                <button
                  onClick={() => removeExam(exam.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
                
                <h3 className="font-bold text-white mb-2">{exam.name}</h3>
                <p className="text-xs text-zinc-500 mb-3">
                  {new Date(exam.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                
                {countdown && (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-zinc-800 rounded-lg p-2">
                      <p className="text-2xl font-bold text-purple-400">{countdown.days}</p>
                      <p className="text-xs text-zinc-500">Days</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-2">
                      <p className="text-2xl font-bold text-blue-400">{countdown.hours}</p>
                      <p className="text-xs text-zinc-500">Hours</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-2">
                      <p className="text-2xl font-bold text-green-400">{countdown.minutes}</p>
                      <p className="text-xs text-zinc-500">Mins</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-2">
                      <p className="text-2xl font-bold text-yellow-400">{countdown.seconds}</p>
                      <p className="text-xs text-zinc-500">Secs</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamTracker;
