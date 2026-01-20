import { Clock, Utensils, BookOpen, Brain, Moon, Sun, Dumbbell } from "lucide-react";

const routineData = [
  { time: "5:30 AM - 6:00 AM", activity: "Wake Up & Freshen Up", details: "Uth, brush, stretch. Affirmation: 'College clear, NEET 1k under.'", icon: Sun },
  { time: "6:00 AM - 7:00 AM", activity: "Exercise + Breakfast", details: "Walk/yoga 20 min, protein breakfast.", icon: Dumbbell },
  { time: "7:00 AM - 11:00 AM", activity: "Main Session 1 (4 hrs)", details: "Chem/Physics/Organic one-shot/notes. College extra 30 min if needed.", icon: BookOpen },
  { time: "11:00 AM - 11:15 AM", activity: "Break", details: "Snack, stretch.", icon: Clock },
  { time: "11:15 AM - 1:15 PM", activity: "Practice QS (2 hrs)", details: "40-60 QS: 30 NEET (2020-25), 20 JEE (2023-25), 10 Exemplar. Error log 15 min.", icon: Brain },
  { time: "1:15 PM - 2:00 PM", activity: "Lunch + Rest", details: "Lunch, relax no screens.", icon: Utensils },
  { time: "2:00 PM - 5:30 PM", activity: "Parallel Session (3.5 hrs)", details: "Bio one-shot/notes/diagrams + PYQs. College rev 30 min.", icon: BookOpen },
  { time: "5:30 PM - 7:00 PM", activity: "Temple/Aarti", details: "Temple ja, Aarti, relax.", icon: Moon },
  { time: "7:00 PM - 8:00 PM", activity: "Dinner + Family Time", details: "Dinner, motivate chat.", icon: Utensils },
  { time: "8:00 PM - 9:00 PM", activity: "Doubts Clear (1 hr)", details: "Telegram: Doubts/stuck/missing clear (NCERT/alt clip).", icon: Brain },
  { time: "9:00 PM - 10:00 PM", activity: "Main Session 2 (1 hr)", details: "Extra QS (10-15 JEE/Exemplar) or college/NEET rev.", icon: BookOpen },
  { time: "10:00 PM - 10:30 PM", activity: "Wind Down", details: "Next day plan.", icon: Clock },
  { time: "10:30 PM", activity: "Sleep", details: "7-8 hrs must.", icon: Moon },
];

const DailyRoutineTable = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
      <div className="p-4 bg-gradient-pastel">
        <h3 className="text-lg font-bold text-white drop-shadow-sm">Daily Routine Template</h3>
        <p className="text-white/80 text-sm">11-13 hrs study, fixed schedule</p>
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
    </div>
  );
};

export default DailyRoutineTable;
