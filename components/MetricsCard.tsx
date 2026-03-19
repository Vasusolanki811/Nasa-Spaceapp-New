
import React from 'react';
import type { AnalyzedSolarData } from '../types';

interface MetricsCardProps {
  topSite: AnalyzedSolarData;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ topSite }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Top Site Details</h3>
      <div className="flex-grow">
        <div className="mb-3">
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-semibold text-blue-600">{topSite.locationName}</p>
        </div>
        <div className="mb-3">
          <p className="text-sm text-gray-500">Coordinates</p>
          <p className="font-semibold text-gray-700">
            Lat {topSite.lat.toFixed(2)}, Lon {topSite.lon.toFixed(2)}
          </p>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">Monthly GHI Variability (CoV)</p>
          <p className="font-semibold text-gray-700">{topSite.ghi_cov.toFixed(3)}</p>
        </div>
      </div>
      <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md mt-auto">
        <p className="text-sm font-semibold">Final Suitability Score</p>
        <p className="text-3xl font-bold">{topSite.final_suitability_score.toFixed(4)}</p>
      </div>
    </div>
  );
};

export default MetricsCard;
