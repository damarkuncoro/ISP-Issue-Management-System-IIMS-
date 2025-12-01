
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

interface OpticalDataPoint {
  time: string;
  rx: number; // dBm
  tx: number; // dBm
  temp?: number; // Celsius
  voltage?: number; // Volts
}

interface OpticalChartProps {
  data: OpticalDataPoint[];
  thresholds?: {
    rxMin: number;
    rxMax: number;
  };
}

const OpticalChart: React.FC<OpticalChartProps> = ({ data, thresholds = { rxMin: -27, rxMax: -8 } }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                Optical Signal Levels (dBm)
            </h4>
            <p className="text-xs text-slate-500">Historical Rx/Tx power readings (24 Hours)</p>
        </div>
        <div className="flex gap-4 text-xs">
            <div className="flex flex-col items-end">
                <span className="text-slate-400 font-bold uppercase">Current Rx</span>
                <span className={`font-mono font-bold ${data[data.length-1]?.rx < -27 ? 'text-red-600' : 'text-green-600'}`}>
                    {data[data.length-1]?.rx.toFixed(2)} dBm
                </span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-slate-400 font-bold uppercase">Current Tx</span>
                <span className="font-mono font-bold text-blue-600">
                    {data[data.length-1]?.tx.toFixed(2)} dBm
                </span>
            </div>
        </div>
      </div>
      
      <div className="h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{fontSize: 10, fill: '#64748b'}} interval={3} />
            <YAxis domain={[-35, 5]} tick={{fontSize: 10, fill: '#64748b'}} label={{ value: 'dBm', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                formatter={(val: number) => [`${val.toFixed(2)} dBm`]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            <ReferenceLine y={thresholds.rxMin} stroke="red" strokeDasharray="3 3" label={{ value: 'Min Sensitivity', position: 'insideBottomRight', fontSize: 10, fill: 'red', dy: 10 }} />
            <ReferenceLine y={thresholds.rxMax} stroke="orange" strokeDasharray="3 3" label={{ value: 'Overload', position: 'insideTopRight', fontSize: 10, fill: 'orange', dy: -10 }} />
            
            <Line type="monotone" dataKey="rx" stroke="#10b981" name="Rx Power" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="tx" stroke="#3b82f6" name="Tx Power" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 flex justify-between">
          <span>Temperature: <strong>{data[data.length-1]?.temp?.toFixed(1)}°C</strong></span>
          <span>Voltage: <strong>{data[data.length-1]?.voltage?.toFixed(2)}V</strong></span>
          <span>Bias Current: <strong>12.5 mA</strong></span>
      </div>
    </div>
  );
};

export default OpticalChart;
