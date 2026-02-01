import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { getLast30DaysStats } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DayData {
  date: string;
  displayDate: string;
  completed: number;
  overtime: number;
  distractions: number;
}

const StatsGraph = () => {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const sessions = await getLast30DaysStats();
        
        const chartData: DayData[] = sessions.map(session => ({
          date: session.date,
          displayDate: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: session.completed ? 100 : 0,
          overtime: session.totalOvertime || 0,
          distractions: session.distractionCount || 0
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-5 border border-zinc-800 h-80 flex items-center justify-center">
        <div className="text-zinc-500">Loading stats...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-5 border border-zinc-800 h-80 flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <p className="text-lg mb-2">No data yet</p>
          <p className="text-sm">Complete study sessions to see your progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-5 border border-zinc-800">
      <h3 className="font-semibold text-lg mb-4">Progress Overview (Last 30 Days)</h3>
      
      <Tabs defaultValue="completion" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 bg-zinc-800/50">
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="overtime">Overtime</TabsTrigger>
          <TabsTrigger value="distractions">Distractions</TabsTrigger>
        </TabsList>

        <TabsContent value="completion" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="displayDate" 
                tick={{ fill: '#71717a', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fill: '#71717a', fontSize: 10 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(value: number) => [`${value}%`, 'Completion']}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#22c55e" 
                fill="url(#completionGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="overtime" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="displayDate" 
                tick={{ fill: '#71717a', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(value: number) => [`${value} min`, 'Overtime']}
              />
              <Bar 
                dataKey="overtime" 
                fill="#f97316" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="distractions" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="displayDate" 
                tick={{ fill: '#71717a', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fill: '#71717a', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(value: number) => [value, 'Distractions']}
              />
              <Line 
                type="monotone" 
                dataKey="distractions" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsGraph;
