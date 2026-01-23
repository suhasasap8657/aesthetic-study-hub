import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface DailyProgress {
  date: string;
  tasksCompleted: number;
}

const ProgressGraph = () => {
  const [progressData] = useLocalStorage<DailyProgress[]>("neet-daily-progress", []);

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
    <div className="glass-card rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-pastel flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </span>
          Progress Graph
        </h3>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Avg/Day</p>
          <p className="text-lg font-bold text-primary">{avgPerDay} tasks</p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(280 20% 25%)" />
              <XAxis 
                dataKey="displayDate" 
                stroke="hsl(280 15% 65%)"
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(280 15% 65%)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(280 25% 15%)",
                  border: "1px solid hsl(300 40% 80% / 0.2)",
                  borderRadius: "8px",
                  color: "hsl(300 20% 95%)",
                }}
                labelStyle={{ color: "hsl(330 80% 70%)" }}
              />
              <Line
                type="monotone"
                dataKey="tasksCompleted"
                stroke="hsl(330 80% 70%)"
                strokeWidth={3}
                dot={{ fill: "hsl(330 80% 70%)", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(270 60% 70%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          <div className="text-center">
            <p>No progress data yet</p>
            <p className="text-xs mt-1">Complete tasks to see your graph!</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-muted/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-sakura">{totalCompleted}</p>
          <p className="text-xs text-muted-foreground">Total Tasks Done</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-lavender">{progressData.length}</p>
          <p className="text-xs text-muted-foreground">Days Tracked</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressGraph;
