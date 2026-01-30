import { useMemo, useState, useEffect, useCallback } from "react";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PROGRESS_UPDATED_EVENT = "neet-progress-updated";

interface DailyProgress {
  date: string;
  tasksCompleted: number;
}

const ProgressGraph = () => {
  const [progressData, setProgressData] = useState<DailyProgress[]>([]);

  const loadProgressData = useCallback(() => {
    const stored = localStorage.getItem("neet-daily-progress");
    if (stored) {
      setProgressData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    loadProgressData();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadProgressData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleStorageChange);
    };
  }, [loadProgressData]);

  const chartData = useMemo(() => {
    // Get last 14 days of data for display
    const sortedData = [...progressData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedData.slice(-14).map(item => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [progressData]);

  const totalCompleted = progressData.reduce((acc, curr) => acc + curr.tasksCompleted, 0);
  const avgPerDay = progressData.length > 0 
    ? Math.round(totalCompleted / progressData.length) 
    : 0;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-pastel flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </span>
          Progress Graph
        </h3>
        <div className="text-right">
          <p className="text-xs sm:text-sm text-muted-foreground">Avg/Day</p>
          <p className="text-base sm:text-lg font-bold text-primary">{avgPerDay} tasks</p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-40 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(280 20% 25%)" />
              <XAxis 
                dataKey="displayDate" 
                stroke="hsl(280 15% 65%)"
                fontSize={9}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(280 15% 65%)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(280 25% 15%)",
                  border: "1px solid hsl(300 40% 80% / 0.2)",
                  borderRadius: "8px",
                  color: "hsl(300 20% 95%)",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(330 80% 70%)" }}
              />
              <Line
                type="monotone"
                dataKey="tasksCompleted"
                stroke="hsl(330 80% 70%)"
                strokeWidth={2}
                dot={{ fill: "hsl(330 80% 70%)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "hsl(270 60% 70%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-40 sm:h-48 flex items-center justify-center text-muted-foreground text-sm">
          <div className="text-center">
            <p>No progress data yet</p>
            <p className="text-xs mt-1">Complete tasks to see your graph!</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-muted/20 rounded-lg p-2.5 sm:p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-sakura">{totalCompleted}</p>
          <p className="text-xs text-muted-foreground">Total Tasks Done</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2.5 sm:p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-lavender">{progressData.length}</p>
          <p className="text-xs text-muted-foreground">Days Tracked</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressGraph;
