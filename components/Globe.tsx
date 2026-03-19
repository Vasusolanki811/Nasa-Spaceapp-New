
import React, { useEffect, useState, useMemo } from 'react';
import type { AnalyzedSolarData } from '../types';

// Lazy load react-globe.gl to improve initial page load
const Globe = React.lazy(() => import('react-globe.gl'));

interface GlobeProps {
  data: AnalyzedSolarData[];
  topSite: AnalyzedSolarData;
}

const GlobeComponent: React.FC<GlobeProps> = ({ data, topSite }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // react-globe.gl relies on window, so we only render it on the client
    setIsClient(true);
  }, []);

  const colorScale = (score: number) => {
    // YlOrRd-like color scale: from light yellow (low) to deep red (high)
    if (score < 0.2) return 'rgba(255, 255, 178, 0.7)';
    if (score < 0.4) return 'rgba(254, 204, 92, 0.7)';
    if (score < 0.6) return 'rgba(253, 141, 60, 0.7)';
    if (score < 0.8) return 'rgba(240, 59, 32, 0.7)';
    return 'rgba(189, 0, 38, 0.7)';
  };

  const globePointsData = useMemo(() => data.map(d => ({
    ...d,
    lat: d.lat,
    lng: d.lon,
    size: 0.25,
    color: colorScale(d.final_suitability_score)
  })), [data]);

  const topSiteLabel = useMemo(() => ({
    lat: topSite.lat,
    lng: topSite.lon,
    text: '★ Top Site',
    color: 'red',
    size: 20
  }), [topSite]);


  const labelsData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data]
      .sort((a, b) => b.final_suitability_score - a.final_suitability_score)
      .slice(0, 12) // Show top 12 labels for clarity
      .map(d => ({
        lat: d.lat,
        lng: d.lon,
        text: d.locationName === "Geographic Location" ? "Potential Site" : d.locationName,
        size: 0.5,
        color: 'rgba(255, 255, 255, 0.9)',
        dotRadius: 0.1,
        resolution: 2
      }));
  }, [data]);

  const topSiteRing = useMemo(() => [{
    lat: topSite.lat,
    lng: topSite.lon,
    color: '#ff4444'
  }], [topSite]);

  // Custom HTML marker for the top site
  const htmlMarkers = useMemo(() => {
    if (!topSite) return [];
    return [{
      lat: topSite.lat,
      lng: topSite.lon,
      name: topSite.locationName,
      score: topSite.final_suitability_score
    }];
  }, [topSite]);

  if (!isClient || !data || data.length === 0) {
    return <div className="flex items-center justify-center h-full"><p className="text-white">Loading Globe Data...</p></div>;
  }
  
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-white">Loading Globe...</p></div>}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.2}
        
        // Individual Data Points (Prominent dots)
        pointsData={globePointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="size"
        pointAltitude={0.01}
        pointLabel={(d: any) => `
          <div class="p-2 bg-slate-900 text-white rounded border border-slate-700 shadow-xl">
            <b>${d.locationName}</b><br/>
            Score: ${d.final_suitability_score.toFixed(4)}
          </div>
        `}

        // Labels for top sites
        labelsData={labelsData}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelSize="size"
        labelColor="color"
        labelDotRadius="dotRadius"
        labelResolution="resolution"
        labelAltitude={0.02}
        
        // Top Site Beacon
        htmlElementsData={htmlMarkers}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-12 h-12 bg-red-500/20 rounded-full animate-ping"></div>
              <div class="absolute w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
                <span class="text-[8px] text-white font-bold">★</span>
              </div>
              <div class="absolute bottom-8 bg-slate-900/95 backdrop-blur-md p-2 rounded-lg text-[10px] text-white whitespace-nowrap shadow-2xl border border-slate-700">
                <div class="font-bold text-emerald-400 mb-1">★ TOP SITE PICK</div>
                <div class="text-xs font-bold">${d.name}</div>
                <div class="text-[9px] text-slate-400">Score: ${d.score.toFixed(4)}</div>
              </div>
            </div>
          `;
          return el;
        }}
        
        ringsData={topSiteRing}
        ringColor={d => (d as any).color}
        ringMaxRadius={8}
        ringPropagationSpeed={3}
        ringRepeatPeriod={800}
        
        enablePointerInteraction={true}
        autoRotate={true}
        autoRotateSpeed={0.8}
      />
    </React.Suspense>
  );
};

export default GlobeComponent;
