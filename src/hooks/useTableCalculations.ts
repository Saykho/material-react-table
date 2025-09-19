import { useMemo } from 'react';
import type { AggregatedData } from '../types';

interface UseTableCalculationsProps {
  aggregatedData: AggregatedData[];
}

/**
 * Хук для вычисления итогов таблицы
 */
export const useTableCalculations = ({ aggregatedData }: UseTableCalculationsProps) => {
  // Вычисляем итоги по периодам
  const periodTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    aggregatedData.forEach(userData => {
      Object.entries(userData.periods).forEach(([period, hours]) => {
        totals[period] = (totals[period] || 0) + hours;
      });
    });
    return totals;
  }, [aggregatedData]);

  // Общий итог
  const grandTotal = useMemo(() => {
    return aggregatedData.reduce((sum, userData) => sum + userData.total, 0);
  }, [aggregatedData]);

  // Данные для таблицы (используем footer для итогов)
  const tableData = useMemo(() => {
    return aggregatedData;
  }, [aggregatedData]);

  return {
    periodTotals,
    grandTotal,
    tableData,
  };
};
