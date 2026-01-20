import { useState } from "react";
import { Calendar, BookOpen, Target, ClipboardList, Sparkles } from "lucide-react";
import TabButton from "@/components/TabButton";
import DailyRoutineTable from "@/components/DailyRoutineTable";
import Guidelines from "@/components/Guidelines";
import QuoteCard from "@/components/QuoteCard";
import MonthPlan from "@/components/MonthPlan";
import { januaryPlan, februaryPlan, marchPlan } from "@/data/monthlyPlans";
import backgroundImage from "@/assets/background.jpg";

type Tab = "home" | "guidelines" | "routine" | "january" | "february" | "march";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const tabs = [
    { id: "home" as Tab, label: "Home", icon: <Sparkles className="w-4 h-4" /> },
    { id: "guidelines" as Tab, label: "Guidelines", icon: <Target className="w-4 h-4" /> },
    { id: "routine" as Tab, label: "Daily Routine", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "january" as Tab, label: "January", icon: <Calendar className="w-4 h-4" /> },
    { id: "february" as Tab, label: "February", icon: <Calendar className="w-4 h-4" /> },
    { id: "march" as Tab, label: "March", icon: <Calendar className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Hero Section */}
            <div className="glass-strong rounded-3xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-pastel flex items-center justify-center animate-float">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Welcome, <span className="gradient-text">Mischile</span>! 🌟
              </h1>
              <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                Your personalized NEET 2026 study planner. Target: Under 1k rank (660+ marks). 
                Let's achieve this together!
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { label: "Target Rank", value: "<1000", color: "from-pastel-blue to-pastel-purple" },
                  { label: "Target Score", value: "660+", color: "from-pastel-green to-pastel-blue" },
                  { label: "Mocks Goal", value: "100+", color: "from-pastel-pink to-pastel-purple" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="glass-card rounded-xl p-4 animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            <QuoteCard />

            {/* Quick Overview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-5 animate-fade-in animation-delay-200">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pastel-blue to-pastel-green flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </span>
                  Current Focus
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pastel-blue" />
                    Chemistry (60-70 QS daily)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pastel-green" />
                    Biology (80-90 QS daily)
                  </li>
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-5 animate-fade-in animation-delay-300">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pastel-pink to-pastel-purple flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </span>
                  Timeline
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-pastel-blue">Jan:</span>
                    Organic + College Exams
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-pastel-green">Feb:</span>
                    Physical Chem + 1 chapter Inorganic
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-pastel-pink">Mar:</span>
                    Chem done by 6th, Physics starts 1st
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-pastel-purple">Mar 15 - May 1:</span>
                    2 mocks/day (~100 mocks)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "guidelines":
        return <Guidelines />;
      case "routine":
        return <DailyRoutineTable />;
      case "january":
        return <MonthPlan {...januaryPlan} />;
      case "february":
        return <MonthPlan {...februaryPlan} />;
      case "march":
        return <MonthPlan {...marchPlan} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-white/30 via-white/20 to-white/30 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="glass sticky top-0 z-50 border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-pastel flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg gradient-text">Mischile NEET Planner</h1>
                  <p className="text-xs text-muted-foreground">NEET 2026 • Under 1k Rank</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">Today</p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="glass sticky top-[73px] z-40 border-b border-white/20 overflow-x-auto">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={tab.icon}
                >
                  {tab.label}
                </TabButton>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 pb-20">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="glass border-t border-white/20 mt-auto">
          <div className="container mx-auto px-4 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Welcome Mischile, made with love by your man :)
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
