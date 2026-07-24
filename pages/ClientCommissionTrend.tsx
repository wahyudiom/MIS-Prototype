
import React from 'react';
import ProfitLossTrend from './ProfitLossTrend';

const categories = ['Institutional', 'Retail'];

const ClientCommissionTrend: React.FC = () => {
  return (
    <ProfitLossTrend 
      title="Client Commission Trend" 
      subtitle="Monthly trend for YYYY" 
      categories={categories}
    />
  );
};

export default ClientCommissionTrend;
