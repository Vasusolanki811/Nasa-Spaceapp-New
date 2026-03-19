
import React, { useState, useEffect, useMemo } from 'react';
import Globe from './components/Globe';
import BarChartComponent from './components/BarChartComponent';
import Header from './components/Header';
import MetricsCard from './components/MetricsCard';
import Spinner from './components/Spinner';
import CorrelationMatrix from './components/CorrelationMatrix';
import DistributionChart from './components/DistributionChart';
import BenchmarkChart from './components/BenchmarkChart';
import ScatterPlot from './components/ScatterPlot';
import { generateAndAnalyzeData } from './services/solarDataService';
import type { AnalyzedSolarData, MonthlyData } from './types';

const App: React.FC = () => {
  const [analyzedData, setAnalyzedData] = useState<AnalyzedSolarData[] | null>(null);
  const [topSite, setTopSite] = useState<AnalyzedSolarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { allData, topSiteData } = await generateAndAnalyzeData();
        setAnalyzedData(allData);
        setTopSite(topSiteData);
      } catch (err) {
        setError('Failed to generate and analyze data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const topSiteMonthlyData: MonthlyData[] | null = useMemo(() => {
    if (!topSite) return null;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return topSite.monthlyGHI.map((ghi, index) => ({
      month: monthNames[index],
      ghi,
    }));
  }, [topSite]);

  const top10Sites = useMemo(() => {
    if (!analyzedData) return [];
    return [...analyzedData]
      .sort((a, b) => b.final_suitability_score - a.final_suitability_score)
      .slice(0, 10);
  }, [analyzedData]);


  if (isLoading) {
    return <Spinner />;
  }

  if (error || !analyzedData || !topSite || !topSiteMonthlyData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
          <p className="text-gray-700">{error || "Could not load dashboard data."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-4 lg:p-6 space-y-8">
        {/* Hero Section: Globe Heatmap */}
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Global Solar Suitability Globe</h3>
                    <p className="text-sm text-gray-500">3D distribution of solar potential and site suitability scores</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Live Analysis</span>
                </div>
            </div>
             <div className="h-[500px] md:h-[650px] lg:h-[750px] w-full bg-slate-950 relative">
                <Globe data={analyzedData} topSite={topSite} />
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/20 max-w-xs">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Suitability Scale</h4>
                    <div className="h-2 w-full bg-gradient-to-r from-[#ffffb2] via-[#fd8d3c] to-[#bd0026] rounded-full mb-1"></div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-600">
                        <span>LOW</span>
                        <span>OPTIMAL</span>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Top Site Metrics & Monthly Climatology */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
             <MetricsCard topSite={topSite} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly GHI Climatology at Top Site</h3>
                <div className="w-full h-80">
                   <BarChartComponent data={topSiteMonthlyData} />
                </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full overflow-hidden flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Top 10 High-Potential Sites</h3>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Location</th>
                                    <th className="px-4 py-2 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {top10Sites.map((site, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[150px]">
                                            <div className="flex flex-col">
                                                <span>{site.locationName === "Geographic Location" ? `Site ${i+1}` : site.locationName}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">{site.lat.toFixed(2)}°, {site.lon.toFixed(2)}°</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">{(site.final_suitability_score * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1">
                <ScatterPlot data={analyzedData} />
            </div>
            <div className="lg:col-span-1">
                <BenchmarkChart data={analyzedData} topSite={topSite} />
            </div>
            <div className="lg:col-span-1">
                <DistributionChart data={analyzedData} />
            </div>
            <div className="lg:col-span-1">
                <CorrelationMatrix data={analyzedData} />
            </div>
        </div>
      </main>
      <footer className="text-center py-8 text-gray-400 text-xs border-t mt-12">
        <p>© 2026 Global Solar Suitability Dashboard · Advanced Climate Analytics</p>
      </footer>
    </div>
  );
};

export default App;
