
import type { SolarDataPoint, AnalyzedSolarData } from '../types';

// --- CONFIGURATION ---
const USER_LAT = -23.50;
const USER_LON = -69.50; // Converted from 290.50 (360-based) to -69.50 (180-based)
const USER_SCORE = 0.9529;
const USER_LOCATION_NAME = "★ TOP SITE (FORCED): Sierra Gorda, Antofagasta, Chile";

const normalizeValue = (val: number, min: number, max: number): number => {
    if (max - min === 0) return 0.5;
    return (val - min) / (max - min);
}

const generateDummyData = (): SolarDataPoint[] => {
    const data: SolarDataPoint[] = [];
    const lats = Array.from({ length: 180 / 10 + 1 }, (_, i) => -90 + i * 10); // Slightly denser grid
    const lons = Array.from({ length: 360 / 15 + 1 }, (_, i) => -180 + i * 15);

    for (const lat of lats) {
        for (const lon of lons) {
            const point: SolarDataPoint = {
                lat,
                lon,
                sfc_sw_down_all_mon: [],
                sfc_sw_down_clr_t_mon: [],
            };

            // --- REALISTIC CLIMATE MODELING ---
            
            // 1. Latitude Factor (Primary driver of GHI)
            const latRad = (lat * Math.PI) / 180;
            const latFactor = Math.cos(latRad); 
            
            // 2. Desert/Aridity Factor (Sub-tropical high pressure belts)
            // Smooth Gaussian-like peak around 25 degrees N/S
            const desertPeak = 25;
            const desertWidth = 12;
            const desertFactor = 1 + 0.35 * (
                Math.exp(-Math.pow(Math.abs(lat) - desertPeak, 2) / (2 * Math.pow(desertWidth, 2)))
            );
            
            // 3. Cloud/Humidity Factor (Independent noise to break perfect correlations)
            // ITCZ (Equator) is cloudier, Sub-tropics (25-30) are clearer
            const itczFactor = 1 - 0.25 * Math.exp(-Math.pow(lat, 2) / (2 * Math.pow(8, 2)));
            const cloudNoise = (0.7 + Math.random() * 0.3) * itczFactor;
            
            // Base clear sky potential (Top of Atmosphere - Atmosphere absorption)
            const baseClearSky = 310 * latFactor * (0.85 + 0.15 * desertFactor);

            for (let i = 0; i < 12; i++) {
                // 4. Seasonal variation (Tilt of the Earth)
                // Northern hemisphere peaks in June (i=5), Southern in Dec (i=11)
                const monthOffset = lat >= 0 ? 0 : 6;
                const seasonPhase = ((i + monthOffset) / 12) * 2 * Math.PI;
                const seasonAmplitude = 0.4 * (Math.abs(lat) / 90); // Stronger at poles
                const seasonFactor = 1 + seasonAmplitude * Math.cos(seasonPhase - Math.PI/2);
                
                // Clear sky GHI with some daily-level noise
                const clearSkyGHI = Math.max(10, baseClearSky * seasonFactor + (Math.random() - 0.5) * 15);
                
                // 5. Clearness Index (Kt)
                // Driven by desert factor but with significant local weather noise
                const baseKt = 0.55 * desertFactor * cloudNoise;
                // Add some monthly variability to Kt
                const monthlyCloudNoise = 0.9 + Math.random() * 0.2;
                const kt = Math.min(0.85, Math.max(0.15, baseKt * monthlyCloudNoise + (Math.random() - 0.5) * 0.1));
                
                const monthlyGHI = clearSkyGHI * kt;
                
                point.sfc_sw_down_all_mon.push(monthlyGHI);
                point.sfc_sw_down_clr_t_mon.push(clearSkyGHI);
            }
            data.push(point);
        }
    }
    return data;
}

const calculateSuitabilityScore = (data: SolarDataPoint[]): AnalyzedSolarData[] => {
    const analyzed = data.map(point => {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        const monthly_energy = point.sfc_sw_down_all_mon.map((ghi, i) => (ghi * 24 * daysInMonth[i]) / 1000);
        const annual_ghi_potential = monthly_energy.reduce((a, b) => a + b, 0);

        const kt_monthly = point.sfc_sw_down_all_mon.map((ghi, i) => {
            const clear_sky = point.sfc_sw_down_clr_t_mon[i];
            return clear_sky > 1e-6 ? Math.min(ghi / clear_sky, 1.0) : 0;
        });
        const annual_mean_kt = kt_monthly.reduce((a, b) => a + b, 0) / 12;

        const ghi_mean = point.sfc_sw_down_all_mon.reduce((a, b) => a + b, 0) / 12;
        const ghi_std = Math.sqrt(point.sfc_sw_down_all_mon.map(x => Math.pow(x - ghi_mean, 2)).reduce((a, b) => a + b, 0) / 12);
        const ghi_cov = ghi_mean > 1e-6 ? ghi_std / ghi_mean : 0;

        return {
            lat: point.lat,
            lon: point.lon,
            abs_lat: Math.abs(point.lat),
            locationName: "Geographic Location",
            annual_ghi_potential,
            annual_mean_kt,
            ghi_cov,
            final_suitability_score: 0, // will be calculated after normalization
            monthlyGHI: point.sfc_sw_down_all_mon,
        };
    });

    const minGHI = Math.min(...analyzed.map(p => p.annual_ghi_potential));
    const maxGHI = Math.max(...analyzed.map(p => p.annual_ghi_potential));
    const minKt = Math.min(...analyzed.map(p => p.annual_mean_kt));
    const maxKt = Math.max(...analyzed.map(p => p.annual_mean_kt));
    const minCov = Math.min(...analyzed.map(p => p.ghi_cov));
    const maxCov = Math.max(...analyzed.map(p => p.ghi_cov));

    const weight_ghi = 0.50;
    const weight_kt = 0.30;
    const weight_cov = 0.20;

    return analyzed.map(point => {
        const ghi_norm = normalizeValue(point.annual_ghi_potential, minGHI, maxGHI);
        const kt_norm = normalizeValue(point.annual_mean_kt, minKt, maxKt);
        const cov_norm = normalizeValue(point.ghi_cov, minCov, maxCov);

        point.final_suitability_score = (weight_ghi * ghi_norm) + (weight_kt * kt_norm) + (weight_cov * (1 - cov_norm));
        return point;
    });
};

const findNearestPointIndex = (data: AnalyzedSolarData[], lat: number, lon: number): number => {
    let nearestIndex = -1;
    let minDistance = Infinity;

    data.forEach((point, index) => {
        const dist = Math.sqrt(Math.pow(point.lat - lat, 2) + Math.pow(point.lon - lon, 2));
        if (dist < minDistance) {
            minDistance = dist;
            nearestIndex = index;
        }
    });

    return nearestIndex;
}


export const generateAndAnalyzeData = async (): Promise<{ allData: AnalyzedSolarData[], topSiteData: AnalyzedSolarData }> => {
    return new Promise(resolve => {
        setTimeout(() => { // Simulate network delay/processing time
            const dummyData = generateDummyData();
            let analyzedData = calculateSuitabilityScore(dummyData);

            // Assign descriptive names to top sites
            const top10Indices = analyzedData
                .map((p, i) => ({ score: p.final_suitability_score, index: i }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
                .map(x => x.index);

            const regionNames = [
                "Atacama Desert Region", "Sahara Solar Belt", "Arabian Peninsula Hub", 
                "Mojave Solar Corridor", "Australian Outback Zone", "Kalahari High-Potential", 
                "Thar Desert Cluster", "Gobi Plateau Site", "Sonoran Solar Field", "Great Basin Area"
            ];

            top10Indices.forEach((idx, i) => {
                if (analyzedData[idx].locationName === "Geographic Location") {
                    analyzedData[idx].locationName = regionNames[i] || `High-Potential Site ${i + 1}`;
                }
            });

            // Force user-specified data point
            const targetIndex = findNearestPointIndex(analyzedData, USER_LAT, USER_LON);
            
            if (targetIndex !== -1) {
                const originalPoint = analyzedData[targetIndex];
                const topSite = {
                    ...originalPoint,
                    lat: USER_LAT,
                    lon: USER_LON,
                    locationName: USER_LOCATION_NAME,
                    final_suitability_score: USER_SCORE,
                };
                analyzedData[targetIndex] = topSite;
                resolve({ allData: analyzedData, topSiteData: topSite });
            } else {
                 // Fallback if something goes wrong
                resolve({ allData: analyzedData, topSiteData: analyzedData[0] });
            }
        }, 1500); // 1.5 second delay
    });
};
