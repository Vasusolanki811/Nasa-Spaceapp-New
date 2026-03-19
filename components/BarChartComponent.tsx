
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthlyData } from '../types';

interface BarChartProps {
  data: MonthlyData[];
}

const BarChartComponent: React.FC<BarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#6b7280' }} 
          label={{ value: 'Month', position: 'insideBottomRight', offset: -5, fill: '#374151', fontSize: 12 }}
        />
        <YAxis 
          tick={{ fill: '#6b7280' }} 
          label={{ value: 'GHI (W/m²)', angle: -90, position: 'insideLeft', fill: '#374151', fontSize: 12 }} 
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        <Bar dataKey="ghi" name="GHI (W/m²)" fill="#ffc107" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
