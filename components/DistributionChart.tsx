
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AnalyzedSolarData } from '../types';

interface DistributionChartProps {
  data: AnalyzedSolarData[];
}

const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  const histogramData = useMemo(() => {
    const bins = 10;
    const counts = new Array(bins).fill(0);
    data.forEach(d => {
      const binIndex = Math.min(Math.floor(d.final_suitability_score * bins), bins - 1);
      counts[binIndex]++;
    });

    return counts.map((count, i) => ({
      range: `${(i / bins).toFixed(1)} - ${((i + 1) / bins).toFixed(1)}`,
      count,
      score: i / bins
    }));
  }, [data]);

  const colorScale = (score: number) => {
    if (score < 0.2) return '#440154';
    if (score < 0.4) return '#3b528b';
    if (score < 0.6) return '#21918c';
    if (score < 0.8) return '#5ec962';
    return '#fde725';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Global Suitability Distribution</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={histogramData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="range" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              label={{ value: 'Suitability Score Range', position: 'insideBottom', offset: -20, fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              label={{ value: 'Frequency (Count)', angle: -90, position: 'insideLeft', offset: 0, fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }}
            />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {histogramData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorScale(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-sm text-gray-500 text-center">
        Distribution of suitability scores across all analyzed geographic points.
      </p>
    </div>
  );
};

export default DistributionChart;
