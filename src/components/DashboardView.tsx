import React from 'react';
import { ProductItem, StockTransaction } from '../types';
import { SalesPredictionView } from './SalesPredictionView';

interface DashboardViewProps {
  products: ProductItem[];
  transactions: StockTransaction[];
}

export const DashboardView: React.FC<DashboardViewProps> = (props) => {
  return <SalesPredictionView {...props} />;
};
