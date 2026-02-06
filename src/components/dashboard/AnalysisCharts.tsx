import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getSessions, getAllDailyProgress, SessionData, DailyProgress } from '@/lib/firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalysisCharts = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [dailyProgress, setDailyProgress] = useState<Record<string, DailyProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, progressData] = await Promise.all([
        getSessions(),
        getAllDailyProgress()
      ]);
      setSessions(sessionsData);
      setDailyProgress(progressData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get last 30 days for charts
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last30Days = getLast30Days();

  // QS Time Chart Data
  const qsTimeData = {
    labels: last30Days.map(d => {
      const date = new Date(d);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'QS Time (hours)',
        data: last30Days.map(date => {
          const daySessions = sessions.filter(s => s.date === date && s.type === 'qs');
          const totalMinutes = daySessions.reduce((acc, s) => acc + (s.duration / 60), 0);
          return Math.round(totalMinutes / 60 * 10) / 10;
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Video Time Chart Data
  const videoTimeData = {
    labels: last30Days.map(d => {
      const date = new Date(d);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Video Time (hours)',
        data: last30Days.map(date => {
          const daySessions = sessions.filter(s => s.date === date && s.type === 'video');
          const totalMinutes = daySessions.reduce((acc, s) => acc + (s.duration / 60), 0);
          return Math.round(totalMinutes / 60 * 10) / 10;
        }),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Completion Line Chart
  const completionData = {
    labels: last30Days.map(d => {
      const date = new Date(d);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Completion %',
        data: last30Days.map(date => {
          const progress = dailyProgress[date];
          if (!progress) return 0;
          return Math.round((progress.targetsCompleted.length / progress.totalTargets) * 100);
        }),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Targets Done',
        data: last30Days.map(date => {
          const progress = dailyProgress[date];
          return progress?.targetsCompleted.length || 0;
        }),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'transparent',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  };

  // Monthly Pie Chart
  const getMonthlyStats = () => {
    const months = ['February', 'March', 'April', 'May'];
    const completed: number[] = [];
    const pending: number[] = [];

    months.forEach((_, idx) => {
      const monthNum = idx + 2; // Feb = 2, Mar = 3, etc.
      const monthDays = Object.entries(dailyProgress).filter(([date]) => {
        const d = new Date(date);
        return d.getMonth() + 1 === monthNum && d.getFullYear() === 2026;
      });

      const completedCount = monthDays.filter(([, p]) => p.isComplete).length;
      const totalDays = monthDays.length || 1;
      
      completed.push(completedCount);
      pending.push(totalDays - completedCount);
    });

    return { completed, pending };
  };

  const monthlyStats = getMonthlyStats();

  const pieData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [
          Object.values(dailyProgress).filter(p => p.isComplete).length,
          Object.values(dailyProgress).filter(p => !p.isComplete).length || 1
        ],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9ca3af'
        }
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fff',
        bodyColor: '#d4d4d8',
        borderColor: '#3f3f46',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#6b7280' },
        grid: { color: '#27272a' }
      },
      y: {
        ticks: { color: '#6b7280' },
        grid: { color: '#27272a' }
      }
    }
  };

  const dualAxisOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        ticks: { color: '#6b7280' },
        grid: { display: false }
      }
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-zinc-900 border-zinc-800 p-4 h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Analysis & Progress</h2>
      
      {/* QS Time Bar Chart */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <h3 className="font-semibold text-blue-400 mb-4">Question Practice Time (Last 30 Days)</h3>
        <div className="h-64">
          <Bar data={qsTimeData} options={chartOptions} />
        </div>
      </Card>

      {/* Video Time Bar Chart */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <h3 className="font-semibold text-purple-400 mb-4">Video Watch Time (Last 30 Days)</h3>
        <div className="h-64">
          <Bar data={videoTimeData} options={chartOptions} />
        </div>
      </Card>

      {/* Completion Line Chart */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <h3 className="font-semibold text-green-400 mb-4">Daily Completion Progress</h3>
        <div className="h-64">
          <Line data={completionData} options={dualAxisOptions} />
        </div>
      </Card>

      {/* Pie Chart */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <h3 className="font-semibold text-yellow-400 mb-4">Overall Completion</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="w-64 h-64">
            <Pie data={pieData} options={{ 
              ...chartOptions, 
              maintainAspectRatio: true,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom' as const,
                  labels: { color: '#9ca3af' }
                }
              }
            }} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalysisCharts;
