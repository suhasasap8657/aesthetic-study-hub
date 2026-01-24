import { useState } from "react";
import { Calendar, BookOpen, Target, ClipboardList, Sparkles } from "lucide-react";
import TabButton from "@/components/TabButton";
import DailyRoutineTable from "@/components/DailyRoutineTable";
import Guidelines from "@/components/Guidelines";
import QuoteCard from "@/components/QuoteCard";
import MonthPlan from "@/components/MonthPlan";
import CountdownTimer from "@/components/CountdownTimer";
import ProgressGraph from "@/components/ProgressGraph";
import AlarmClock from "@/components/AlarmClock";
import ProgressCalendar from "@/components/ProgressCalendar";
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
            <QuoteCard />

            <div className="grid md:grid-cols-2 gap-4">
              <CountdownTimer />
              <AlarmClock />
            </div>

            <ProgressCalendar />

            <ProgressGraph />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-pastel flex items-center justify-center"><Target className="w-4 h-4 text-white" /></span>
                  Current Focus
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sakura" />Chemistry (60-70 QS daily)</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-lavender" />Biology (80-90 QS daily)</li>
                </ul>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-pastel flex items-center justify-center"><Calendar className="w-4 h-4 text-white" /></span>
                  Timeline
                </h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-medium text-sakura">Jan:</span> Organic + College Exams</li>
                  <li><span className="font-medium text-lavender">Feb:</span> Physical Chem + 1 chapter Inorganic</li>
                  <li><span className="font-medium text-peach">Mar 6th:</span> Chem syllabus done</li>
                  <li><span className="font-medium text-secondary">Mar 15 - May 1:</span> 2 mocks/day (~100 mocks)</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "guidelines": return <Guidelines />;
      case "routine": return <DailyRoutineTable />;
      case "january": return <MonthPlan {...januaryPlan} />;
      case "february": return <MonthPlan {...februaryPlan} />;
      case "march": return <MonthPlan {...marchPlan} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="fixed inset-0 bg-gradient-to-br from-midnight-dark/80 via-midnight/70 to-midnight-dark/80 backdrop-blur-sm" />

      <div className="relative z-10 min-h-screen">
        <header className="glass sticky top-0 z-50 border-b border-border/30">
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
                <p className="text-sm font-medium">{new Date().toLocaleDateString("en-US", { weekday: "long" })}</p>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
          </div>
        </header>

        <nav className="glass sticky top-[73px] z-40 border-b border-border/30 overflow-x-auto">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (<TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} icon={tab.icon}>{tab.label}</TabButton>))}
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-6 pb-20">{renderContent()}</main>

        <footer className="glass border-t border-border/30 mt-auto">
          <div className="container mx-auto px-4 py-4 text-center">
            <p className="text-sm text-muted-foreground">Welcome Mischile, made with love by your man :)</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
