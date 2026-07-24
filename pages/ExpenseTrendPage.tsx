import React from 'react';
import ProfitLossTrend from './ProfitLossTrend';

const categories = [
  'Personnel expenses',
  'Office rental',
  'Depreciation',
  'Marketing expense',
  'System maintenance',
  'Professional fees',
];

const ExpenseTrendPage: React.FC = () => {
  return (
    <ProfitLossTrend
      title="Expense Trend Page"
      subtitle="Monthly trend for YYYY"
      categories={categories}
      chartType="stacked-bar"
    />
  );
};

export default ExpenseTrendPage;
