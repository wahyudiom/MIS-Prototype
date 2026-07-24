
import React from 'react';
import ProfitLossTrend from './ProfitLossTrend';

const categories = ['Structured Warrant', 'ETF', 'Mutual Funds', 'Bonds', 'Equity'];

const ProductCommissionTrend: React.FC = () => {
  return (
    <ProfitLossTrend
      title="Product Commission Trend"
      subtitle="Monthly trend for YYYY"
      categories={categories}
      chartType="stacked-bar"
    />
  );
};

export default ProductCommissionTrend;
