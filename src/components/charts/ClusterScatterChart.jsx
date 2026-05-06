import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis 
} from 'recharts';

export function ClusterScatterChart({ clusteredData }) {
  // Vibrant colors for up to 5 clusters
  const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

  // Custom tooltip to show what exactly the point represents
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-xl">
          <p className="font-medium text-slate-200">{data.label}</p>
          <p className="text-sm text-slate-400">Day of Month: {Math.round(data.x)}</p>
          <p className="text-sm font-bold text-slate-100 mt-1">₹{Math.round(data.y).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide">Cluster {data.cluster + 1}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          
          {/* X Axis: Day of the Month (1-31) */}
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Day" 
            stroke="#94a3b8" 
            domain={[1, 31]} 
            tickCount={10}
            tickLine={false}
          />
          
          {/* Y Axis: Transaction Amount */}
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Amount" 
            stroke="#94a3b8" 
            tickFormatter={(v) => `₹${v}`}
            tickLine={false}
            axisLine={false}
          />
          
          {/* Z Axis makes the dots a bit larger and uniform */}
          <ZAxis type="number" range={[60, 60]} />
          
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
          
          <Scatter name="Transactions" data={clusteredData} animationDuration={1000}>
            {clusteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.cluster % COLORS.length]} opacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
