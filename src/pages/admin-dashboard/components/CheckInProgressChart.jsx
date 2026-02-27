import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CheckInProgressChart = ({ hourlyData }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-xl p-3 shadow-elevation-3">
          <p className="text-sm font-semibold text-foreground mb-2">{payload?.[0]?.payload?.hour}</p>
          <p className="text-xs text-success">
            Checked In: <span className="font-bold">{payload?.[0]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 lg:p-8 shadow-elevation-2 border border-border">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Hourly Check-In Progress</h2>
      
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Hourly Check-In Progress Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="hour" 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px', color: 'var(--color-foreground)' }}
            />
            <Bar 
              dataKey="checkedIn" 
              fill="var(--color-success)" 
              radius={[8, 8, 0, 0]}
              name="Checked In"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CheckInProgressChart;