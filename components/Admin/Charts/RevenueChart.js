import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function RevenueChart({ data, timeRange = '7d', currencySymbol = 'Rs' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate sample data if none provided
  const generateSampleData = (days) => {
    const sampleData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      sampleData.push({
        date: format(date, 'MMM dd'),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        orders: Math.floor(Math.random() * 50) + 10,
      });
    }
    return sampleData;
  };

  const chartData = data || generateSampleData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Revenue: {currencySymbol} {payload[0].value.toLocaleString()}
          </p>
          {payload[1] && (
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Orders: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!mounted) return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chart...</div>;

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /> {/* primary-500 */}
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /> {/* primary-500 */}
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /> {/* purple-500 */}
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /> {/* purple-500 */}
            </linearGradient>
          </defs>
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
            tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* primary-500 */}
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorRevenue)"
            animationDuration={1000}
          />
          {/* purple-500 */}
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#colorOrders)"
            animationDuration={1000}
            yAxisId="right"
            hide
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
