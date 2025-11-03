import React from 'react';

// Tailwind Card Bileşeni
const MetricCard = ({ title, value, detail, icon: Icon, colorClass = 'text-gray-900', bgColor = 'bg-white' }: any) => (
  <div className={`p-5 ${bgColor} rounded-xl shadow-lg border border-gray-100`}>
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {Icon && <Icon className={`h-6 w-6 ${colorClass}`} />}
    </div>
    <p className={`mt-1 text-3xl font-bold ${colorClass}`}>
      {value}
    </p>
    <p className="mt-1 text-xs text-gray-500">{detail}</p>
  </div>
);

export default MetricCard;
