
import React from 'react';
import ProfitLossTrend from './ProfitLossTrend';

const categories = [
  'Brokerage commission', 
  "Interest on Broker's Loans", 
  'PI', 
  'IB Revenue', 
  'Fund Sales Revenue', 
  'FI Sales Revenue', 
  'FI Trading for Portfolio', 
  'Interest on deposits', 
  'Others'
];

const RevenueTrendPage: React.FC = () => {
  return (
    <ProfitLossTrend
      title="Revenue Trend Page"
      subtitle="Monthly trend for YYYY"
      categories={categories}
      chartType="stacked-bar"
    />
  );
};

export default RevenueTrendPage;
