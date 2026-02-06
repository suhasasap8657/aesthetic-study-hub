import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Video, FileQuestion, BookOpen, Play, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getMonthlySchedule, DayTarget } from '@/data/studySchedule';

interface MonthlyTargetsProps {
  onStartSession: (type: 'video' | 'qs', targetId: string, videoUrl?: string) => void;
}

const MonthlyTargets = ({ onStartSession }: MonthlyTargetsProps) => {
  const [openMonths, setOpenMonths] = useState<string[]>([]);
  const [openDays, setOpenDays] = useState<string[]>([]);
  
  const monthlySchedule = getMonthlySchedule();

  const toggleMonth = (month: string) => {
    setOpenMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const toggleDay = (dayId: string) => {
    setOpenDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-purple-400" />;
      case 'qs': return <FileQuestion className="w-4 h-4 text-blue-400" />;
      default: return <BookOpen className="w-4 h-4 text-green-400" />;
    }
  };

  const isToday = (date: string) => {
    return new Date().toISOString().split('T')[0] === date;
  };

  const isPast = (date: string) => {
    return new Date(date) < new Date(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-400" />
        Study Schedule
      </h2>

      {Object.entries(monthlySchedule).map(([month, days]) => (
        <Card key={month} className="bg-zinc-900 border-zinc-800 overflow-hidden">
          <Collapsible open={openMonths.includes(month)} onOpenChange={() => toggleMonth(month)}>
            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                {openMonths.includes(month) ? (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                )}
                <span className="font-bold text-lg">{month}</span>
              </div>
              <span className="text-sm text-zinc-500">{days.length} days</span>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="border-t border-zinc-800">
                {days.map((day: DayTarget) => (
                  <Collapsible 
                    key={day.id} 
                    open={openDays.includes(day.id)} 
                    onOpenChange={() => toggleDay(day.id)}
                  >
                    <CollapsibleTrigger 
                      className={`w-full p-3 pl-8 flex items-center justify-between hover:bg-zinc-800/30 transition-colors border-b border-zinc-800/50 ${
                        isToday(day.date) ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                      } ${isPast(day.date) ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {openDays.includes(day.id) ? (
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        )}
                        <span className={`font-medium ${isToday(day.date) ? 'text-purple-400' : ''}`}>
                          {day.day} {day.month}
                        </span>
                        {isToday(day.date) && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                            TODAY
                          </span>
                        )}
                        {day.isBreak && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            BREAK
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">{day.targets.length} targets</span>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="pl-12 pr-4 py-2 space-y-2 bg-zinc-950/50">
                        {day.targets.map((target) => (
                          <div 
                            key={target.id}
                            className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getTargetIcon(target.type)}
                              <div>
                                <p className="text-sm font-medium">{target.text}</p>
                                {target.type === 'video' && (
                                  <p className="text-xs text-zinc-500">2 hours minimum</p>
                                )}
                              </div>
                            </div>
                            
                            {target.type === 'video' && !isPast(day.date) ? (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStartSession('video', target.id, target.videoUrl);
                                }}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </Button>
                            ) : target.type === 'qs' && !isPast(day.date) ? (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStartSession('qs', target.id);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </Button>
                            ) : target.type === 'normal' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-700"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Done
                              </Button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
};

export default MonthlyTargets;
