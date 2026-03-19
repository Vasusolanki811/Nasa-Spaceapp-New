
export interface SolarDataPoint {
  lat: number;
  lon: number;
  // Monthly time series data
  sfc_sw_down_all_mon: number[]; // GHI
  sfc_sw_down_clr_t_mon: number[]; // Clear-sky GHI
}

export interface AnalyzedSolarData {
  lat: number;
  lon: number;
  abs_lat: number; // For correlation analysis
  locationName: string;
  annual_ghi_potential: number;
  annual_mean_kt: number;
  ghi_cov: number;
  final_suitability_score: number;
  monthlyGHI: number[];
}

export interface MonthlyData {
    month: string;
    ghi: number;
}
