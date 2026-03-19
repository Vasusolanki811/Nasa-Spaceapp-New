
import React, { useMemo } from 'react';
import type { AnalyzedSolarData } from '../types';

interface CorrelationMatrixProps {
  data: AnalyzedSolarData[];
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ data }) => {
  const impactfulData = useMemo(() => {
    // Filter for impactful locations (Suitability > 0.6)
    return data
      .filter(d => d.final_suitability_score > 0.6)
      .sort((a, b) => b.final_suitability_score - a.final_suitability_score);
  }, [data]);

  const metrics = [
    { key: 'abs_lat', label: 'Abs Latitude' },
    { key: 'annual_ghi_potential', label: 'GHI Potential' },
    { key: 'annual_mean_kt', label: 'Clearness (Kt)' },
    { key: 'ghi_cov', label: 'Variability (COV)' },
    { key: 'final_suitability_score', label: 'Suitability' }
  ];

  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    if (n < 2) return 0;
    
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      sumX2 += dx * dx;
      sumY2 += dy * dy;
    }
    
    const denominator = Math.sqrt(sumX2 * sumY2);
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  };

  const matrix = useMemo(() => {
    const res: number[][] = [];
    const analysisData = impactfulData.length > 5 ? impactfulData : data;
    
    metrics.forEach((m1, i) => {
      res[i] = [];
      metrics.forEach((m2, j) => {
        if (i === j) {
          res[i][j] = 1.0;
          return;
        }
        const x = analysisData.map(d => d[m1.key as keyof AnalyzedSolarData] as number);
        const y = analysisData.map(d => d[m2.key as keyof AnalyzedSolarData] as number);
        const corr = calculateCorrelation(x, y);
        res[i][j] = isNaN(corr) ? 0 : corr;
      });
    });
    return res;
  }, [impactfulData, data]);

  const getCellStyles = (val: number) => {
    const absVal = Math.abs(val);
    let bgColor = '';
    let textColor = 'text-gray-800';

    if (val > 0.1) {
      bgColor = `rgba(16, 185, 129, ${absVal * 0.8 + 0.1})`; // Emerald
      if (absVal > 0.5) textColor = 'text-white';
    } else if (val < -0.1) {
      bgColor = `rgba(239, 68, 68, ${absVal * 0.8 + 0.1})`; // Red
      if (absVal > 0.5) textColor = 'text-white';
    } else {
      bgColor = 'rgba(243, 244, 246, 0.5)'; // Gray
    }

    return { backgroundColor: bgColor, textColor };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-800">Impactful Site Correlation</h3>
        <div className="px-2 py-1 bg-emerald-100 rounded text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
          High-Potential Only
        </div>
      </div>
      
      <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest font-bold">
        Analyzing {impactfulData.length} sites with Suitability &gt; 60%
      </p>

      <div className="mb-6">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Impactful Locations:</h4>
        <div className="flex flex-wrap gap-2">
          {impactfulData.slice(0, 5).map((site, idx) => (
            <span key={idx} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[9px] text-slate-600 font-medium">
              {site.locationName === "Geographic Location" ? `Site ${idx+1}` : site.locationName}
            </span>
          ))}
          {impactfulData.length > 5 && <span className="text-[9px] text-slate-400 self-center">+{impactfulData.length - 5} more</span>}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2"></th>
              {metrics.map(m => (
                <th key={m.key} className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  {m.label.split(' ')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m1, i) => (
              <tr key={m1.key}>
                <td className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right pr-4 whitespace-nowrap">
                  {m1.label}
                </td>
                {metrics.map((m2, j) => {
                  const val = matrix[i][j];
                  const { backgroundColor, textColor } = getCellStyles(val);
                  return (
                    <td 
                      key={m2.key} 
                      className="p-0 border border-white"
                    >
                      <div 
                        className={`h-12 w-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:z-10 relative cursor-help group`}
                        style={{ backgroundColor }}
                      >
                        <span className={`text-xs font-bold ${textColor}`}>
                          {val.toFixed(2)}
                        </span>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                          <div className="bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap">
                            <span className="text-slate-400">{m1.label}</span>
                            <span className="mx-1">vs</span>
                            <span className="text-slate-400">{m2.label}</span>
                            <div className="mt-1 font-bold text-emerald-400">Corr: {val.toFixed(4)}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 space-y-3">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Inverse (-1)</span>
          <span>Neutral (0)</span>
          <span>Positive (+1)</span>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-gray-200 to-emerald-500 rounded-full"></div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-[10px] text-slate-500 leading-relaxed">
            <span className="font-bold text-emerald-600">Positive:</span> Metrics move together. High GHI usually correlates with high Suitability.
          </div>
          <div className="text-[10px] text-slate-500 leading-relaxed">
            <span className="font-bold text-red-600">Inverse:</span> Metrics move opposite. High Latitude usually correlates with lower GHI.
          </div>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed italic mt-2">
          * Pearson coefficients calculated across all {data.length} global data points.
        </p>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
