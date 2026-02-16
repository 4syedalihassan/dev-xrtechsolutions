import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data, color = '#3b82f6', height = 40 }) {
  // Generate sample data if none provided
  const sampleData = data || Array.from({ length: 7 }, (_, i) => ({
    value: Math.floor(Math.random() * 50) + 10
  }));

  // Ensure data is in the correct format
  const chartData = sampleData.map(item =>
    typeof item === 'number' ? { value: item } : item
  );

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
