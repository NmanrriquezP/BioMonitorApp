
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HEALTHY_ECG_DATA_PATTERN } from '../../constants';

interface ECGChartProps {
  data?: { name: string; value: number }[];
  height?: number;
}

export const ECGChart: React.FC<ECGChartProps> = ({ data = HEALTHY_ECG_DATA_PATTERN, height = 200 }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No hay datos de ECG para mostrar.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} hide={true} />
        <YAxis tick={{ fontSize: 10, fill: '#666' }} domain={[-0.5, 1.5]}/>
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
          itemStyle={{ color: '#333' }}
          labelStyle={{ color: '#007C83', fontWeight: 'bold' }}
        />
        <Line type="monotone" dataKey="value" stroke="#50C2C9" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
    