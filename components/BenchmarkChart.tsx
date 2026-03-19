
import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AnalyzedSolarData } from '../types';

interface BenchmarkChartProps {
  data: AnalyzedSolarData[];
  topSite: AnalyzedSolarData;
}

const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ data, topSite }) => {
  const benchmarkData = useMemo(() => {
    const avgGHI = data.reduce((a, b) => a + b.annual_ghi_potential, 0) / data.length;
    const avgKt = data.reduce((a, b) => a + b.annual_mean_kt, 0) / data.length;
    const avgCov = data.reduce((a, b) => a + b.ghi_cov, 0) / data.length;
    const avgScore = data.reduce((a, b) => a + b.final_suitability_score, 0) / data.length;

    // Normalize values for radar chart (0-100)
    const normalize = (val: number, avg: number) => {
        const ratio = val / avg;
        return Math.min(Math.max(ratio * 50, 0), 100); // 50 is the average baseline
    };

    return [
      { subject: 'GHI Potential', topSite: normalize(topSite.annual_ghi_potential, avgGHI), average: 50 },
      { subject: 'Clearness (Kt)', topSite: normalize(topSite.annual_mean_kt, avgKt), average: 50 },
      { subject: 'Stability (1-COV)', topSite: normalize(1 - topSite.ghi_cov, 1 - avgCov), average: 50 },
      { subject: 'Suitability Score', topSite: normalize(topSite.final_suitability_score, avgScore), average: 50 },
    ];
  }, [data, topSite]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Top Site vs. Global Average</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={benchmarkData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Top Site"
              dataKey="topSite"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Radar
              name="Global Average"
              dataKey="average"
              stroke="#6b7280"
              fill="#6b7280"
              fillOpacity={0.4}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-sm text-gray-500 text-center">
        Relative performance of the top site compared to the global average across all metrics.
      </p>
    </div>
  );
};

export default BenchmarkChart;
