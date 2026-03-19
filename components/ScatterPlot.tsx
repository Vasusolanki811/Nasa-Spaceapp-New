
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AnalyzedSolarData } from '../types';

interface ScatterPlotProps {
  data: AnalyzedSolarData[];
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
  const chartData = data.map(d => ({
    ghi: d.annual_ghi_potential,
    score: d.final_suitability_score,
    name: d.locationName,
    kt: d.annual_mean_kt
  }));

  const colorScale = (score: number) => {
    if (score > 0.8) return '#10b981'; // emerald-500
    if (score > 0.6) return '#34d399'; // emerald-400
    if (score > 0.4) return '#fbbf24'; // amber-400
    return '#f87171'; // red-400
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">GHI vs. Suitability Score</h3>
        <span className="text-xs font-medium text-gray-400">Correlation Analysis</span>
      </div>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              type="number" 
              dataKey="ghi" 
              name="GHI Potential" 
              unit=" W/m²" 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Annual GHI Potential (W/m²)', position: 'insideBottom', offset: -25, fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
            />
            <YAxis 
              type="number" 
              dataKey="score" 
              name="Suitability Score" 
              stroke="#94a3b8" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Suitability Score (0-1)', angle: -90, position: 'insideLeft', offset: -10, fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
            />
            <ZAxis type="number" dataKey="kt" range={[50, 400]} name="Clearness Index" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{data.name}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">GHI Potential:</span>
                          <span className="font-mono font-bold text-slate-900 ml-4">{data.ghi.toFixed(2)} W/m²</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Suitability Score:</span>
                          <span className="font-mono font-bold text-emerald-600 ml-4">{data.score.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Clearness (Kt):</span>
                          <span className="font-mono font-bold text-blue-600 ml-4">{data.kt.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Locations" data={chartData}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorScale(entry.score)} fillOpacity={0.6} stroke={colorScale(entry.score)} strokeWidth={2} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 flex items-center justify-center space-x-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 opacity-60 mr-2"></div>
          <span>Low Suitability</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-400 opacity-60 mr-2"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-60 mr-2"></div>
          <span>High Suitability</span>
        </div>
      </div>
    </div>
  );
};

export default ScatterPlot;
