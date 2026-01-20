import { Clock, Utensils, BookOpen, Brain, Moon, Sun, Dumbbell } from "lucide-react";

const routineData = [
  { time: "5:30 AM - 6:00 AM", activity: "Wake Up & Freshen Up", details: "Uth, brush, stretch. Affirmation: 'Under 1k progress.'", icon: Sun },
  { time: "6:00 AM - 7:00 AM", activity: "Exercise + Breakfast", details: "Walk/yoga 20 min, protein breakfast.", icon: Dumbbell },
  { time: "7:00 AM - 11:00 AM", activity: "Main Session 1 (4 hrs)", details: "Chem one-shot watch/notes (2-3 hrs watch, 1 hr apply).", icon: BookOpen },
  { time: "11:00 AM - 11:15 AM", activity: "Break", details: "Snack, stretch.", icon: Clock },
  { time: "11:15 AM - 12:45 PM", activity: "Practice QS Chem (1.5 hrs)", details: "60-65 QS: NEET (2015-2025), JEE MAINS (2023-2025), NCERT Exemplar. Error log 15 min.", icon: Brain },
  { time: "12:45 PM - 1:45 PM", activity: "Lunch + Rest", details: "Lunch, relax.", icon: Utensils },
  { time: "1:45 PM - 5:30 PM", activity: "Parallel Session (3.75 hrs)", details: "Bio lecture watch/notes + QS (90 QS: NEET 2015-2025, 10 NCERT Exemplar).", icon: BookOpen },
  { time: "5:30 PM - 7:00 PM", activity: "Temple/Aarti", details: "Relax.", icon: Moon },
  { time: "7:00 PM - 8:00 PM", activity: "Dinner + Family Time", details: "Dinner, chat.", icon: Utensils },
  { time: "8:00 PM - 9:00 PM", activity: "Doubts Clear (1 hr)", details: "Telegram/NCERT: Clear stuck/missing Chem/Bio.", icon: Brain },
  { time: "9:00 PM - 10:30 PM", activity: "Main Session 2 (1.5 hrs)", details: "Extra QS/rev/read NCERT.", icon: BookOpen },
  { time: "10:30 PM", activity: "Sleep", details: "7 hrs.", icon: Moon },
];

const DailyRoutineTable = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
      <div className="p-4 bg-gradient-pastel">
        <h3 className="text-lg font-bold text-white drop-shadow-sm">Daily Routine Template</h3>
        <p className="text-white/80 text-sm">12-14 hrs study, fixed schedule</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/20">
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/80">Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/80">Activity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/80 hidden md:table-cell">Details</th>
            </tr>
          </thead>
          <tbody>
            {routineData.map((item, index) => {
              const Icon = item.icon;
              return (
                <tr
                  key={index}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-primary whitespace-nowrap">
                    {item.time}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-pastel flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-sm">{item.activity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {item.details}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-white/10 border-t border-white/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Weekly Sunday:</span> Revision of entire week
        </p>
      </div>
    </div>
  );
};

export default DailyRoutineTable;
