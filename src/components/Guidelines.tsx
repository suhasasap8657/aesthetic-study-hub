import { Target, BookOpen, Brain, Heart, TrendingUp } from "lucide-react";

const guidelinesData = [
  {
    icon: Target,
    title: "Under 1k Rank Strategy",
    points: [
      "NCERT 10+ reads (Bio line-by-line)",
      "PYQs 2000+ (NEET focus)",
      "Mocks 100+ (analysis 2 hrs each)",
      "Target: Bio 340+, Chem 170+, Phy 160+"
    ],
    color: "from-pastel-blue to-pastel-purple"
  },
  {
    icon: BookOpen,
    title: "PYQ Strategy",
    points: [
      "Per day 40-60 questions",
      "30 NEET 2020-25",
      "20 JEE 2023-25",
      "10 Exemplar",
      "Time-bound: 1 min/QS, 5 min stuck rule"
    ],
    color: "from-pastel-green to-pastel-blue"
  },
  {
    icon: Brain,
    title: "College Priority",
    points: [
      "Jan mein clear",
      "Husbandry/diseases/pests/ethology priority",
      "Feb break rev if leftover"
    ],
    color: "from-pastel-pink to-pastel-purple"
  },
  {
    icon: Heart,
    title: "Health & Tracking",
    points: [
      "Sleep 7-8 hrs mandatory",
      "Exercise daily",
      "Weekly Sunday light rev + 100 PYQs",
      "Jan 31 college mock target"
    ],
    color: "from-pastel-yellow to-pastel-pink"
  },
  {
    icon: TrendingUp,
    title: "Resources",
    points: [
      "Bio one-shots: Seep Pahuja",
      "Chem: Yogesh Jain",
      "Physics: PW",
      "Rev weekly, error logs daily"
    ],
    color: "from-pastel-purple to-pastel-blue"
  }
];

const Guidelines = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {guidelinesData.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all duration-500 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-3 gradient-text">{item.title}</h3>
            <ul className="space-y-2">
              {item.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-pastel mt-2 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default Guidelines;
