import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function SalesDonut({ data, currencySymbol = 'Rs' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate sample data if none provided
  const sampleData = data || [
    { name: 'Perfume', value: 45000, count: 125, color: '#3b82f6' }, // primary-500 from theme
    { name: 'Healthcare', value: 32000, count: 89, color: '#8b5cf6' }, // purple-500 from theme
    { name: 'Accessories', value: 18000, count: 56, color: '#14b8a6' }, // teal-500 from theme
    { name: 'Gift Sets', value: 25000, count: 42, color: '#f97316' }, // orange-500 from theme
    { name: 'Others', value: 12000, count: 33, color: '#ec4899' }, // pink-500 from theme
  ];

  const COLORS = sampleData.map(item => item.color);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {data.name}
          </p>
          <p className="text-sm" style={{ color: data.color }}>
            Sales: {currencySymbol} {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Products: {data.count}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {((data.value / sampleData.reduce((acc, item) => acc + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderLabel = (entry) => {
    const total = sampleData.reduce((acc, item) => acc + item.value, 0);
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  if (!mounted) return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chart...</div>;

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sampleData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
            animationBegin={0}
          >
            {sampleData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
