import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

export default function ActivityBar({ data, timeRange = '7d' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate sample data if none provided
  const generateSampleData = (days) => {
    const sampleData = [];
    const activityTypes = ['Products', 'Orders', 'Customers', 'Sessions'];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dataPoint = {
        date: format(date, 'MMM dd'),
      };

      activityTypes.forEach(type => {
        dataPoint[type] = Math.floor(Math.random() * 30) + 5;
      });

      sampleData.push(dataPoint);
    }
    return sampleData;
  };

  const chartData = data || generateSampleData(timeRange === '7d' ? 7 : 14);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} activities
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!mounted) return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chart...</div>;

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* gray-200 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          {/* gray-400 */}
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          {/* gray-400 */}
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          {/* primary-500 */}
          <Bar
            dataKey="Products"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
          {/* purple-500 */}
          <Bar
            dataKey="Orders"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
          {/* teal-500 */}
          <Bar
            dataKey="Customers"
            fill="#14b8a6"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
          {/* orange-500 */}
          <Bar
            dataKey="Sessions"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
