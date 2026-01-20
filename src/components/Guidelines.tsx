import { CheckCircle, BookOpen, Users, Target } from "lucide-react";

const Guidelines = () => {
  const guidelines = [
    {
      title: "Daily Revision",
      points: [
        "Revise daily what you studied",
        "Make error log daily where you make mistakes",
        "Mention solution to those mistakes in error log",
        "Note down new conceptual or anything new you learn in a QS that is useful",
      ],
      icon: BookOpen,
      color: "from-pastel-blue to-pastel-green",
    },
    {
      title: "Mock Test Strategy",
      points: [
        "After every mock: Analyse thoroughly",
        "Point out every error and fix them",
        "Note down all mistakes in error log",
        "Don't repeat the same mistakes",
        "2 mocks per day from Mar 15 - May 1 (~100 mocks total)",
      ],
      icon: Target,
      color: "from-pastel-pink to-pastel-purple",
    },
    {
      title: "Weekly & Monthly Revision",
      points: [
        "Every Sunday: Revision of entire week",
        "Every Sunday: NCERT revision",
        "Every month end: Revision of entire syllabus of that month",
      ],
      icon: CheckCircle,
      color: "from-pastel-green to-pastel-blue",
    },
    {
      title: "Resources",
      points: [
        "Organic Chemistry: Yogesh Jain Sir",
        "Inorganic Chemistry: MD Sir",
        "Physical Chemistry: Sudanshu Sir",
        "Biology: Flexible (choose what works for you)",
      ],
      icon: Users,
      color: "from-pastel-purple to-pastel-pink",
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-strong rounded-2xl p-5">
        <h2 className="text-2xl font-bold gradient-text mb-2">Study Guidelines</h2>
        <p className="text-muted-foreground text-sm">
          Follow these guidelines consistently for under 1k rank success!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {guidelines.map((guideline, index) => {
          const Icon = guideline.icon;
          return (
            <div
              key={index}
              className="glass-card rounded-2xl p-5 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${guideline.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">{guideline.title}</h3>
              </div>
              <ul className="space-y-2">
                {guideline.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-foreground/80">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Guidelines;
