import { useMemo } from 'react';
import { subDays } from 'date-fns';

/**
 * Хук для управления диапазоном дат
 * По умолчанию возвращает последние 60 дней
 */
export const useDateRange = (days: number = 59) => {
  return useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    return { startDate, endDate };
  }, [days]);
};
