import { useMemo } from 'react';
import type { PeriodType, User, Project } from '../types';
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  parseISO,
  isValid
} from 'date-fns';
import { ru } from 'date-fns/locale';

interface UseAggregatedDataProps {
  users: User[];
  projects: Project[];
  periodType: PeriodType;
  startDate: Date;
  endDate: Date;
}

/**
 * Получаем ключ периода для конкретной даты
 */
const getPeriodKey = (date: Date, periodType: PeriodType): string => {
  switch (periodType) {
    case 'day':
      return format(date, 'yyyy-MM-dd');

    case 'week': {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(weekStart, 'dd.MM')}-${format(weekEnd, 'dd.MM')}`;
    }

    case 'month': {
      return format(startOfMonth(date), 'MMMM yyyy', { locale: ru });
    }

    default:
      return '';
  }
};

/**
 * Генерирует массив периодов на основе типа периода
 */
const generatePeriods = (periodType: PeriodType, startDate: Date, endDate: Date): string[] => {
  switch (periodType) {
    case 'day':
      return eachDayOfInterval({ start: startDate, end: endDate })
        .map(date => format(date, 'yyyy-MM-dd'))
        .sort(); // Сортируем по дате

    case 'week':
      return eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 })
        .map(date => {
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
          return `${format(weekStart, 'dd.MM')}-${format(weekEnd, 'dd.MM')}`;
        })
        .sort(); // Сортируем по дате

    case 'month': {
      // Создаем массив с датами и их отформатированными названиями
      const monthsWithDates = eachMonthOfInterval({ start: startDate, end: endDate })
        .map(date => ({
          date: date,
          formatted: format(date, 'MMMM yyyy', { locale: ru })
        }));

      // Сортируем по дате и возвращаем только отформатированные названия
      return monthsWithDates
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(item => item.formatted);
    }

    default:
      return [];
  }
};

/**
 * Хук для агрегации данных пользователей и генерации периодов
 */
export const useAggregatedData = ({
  users,
  projects,
  periodType,
  startDate,
  endDate,
}: UseAggregatedDataProps) => {
  // Генерируем периоды и агрегируем данные
  const { data: aggregatedData, periods } = useMemo(() => {
    const periods = generatePeriods(periodType, startDate, endDate);
    const data = users.map(user => {
      const periodTotals: { [key: string]: number } = {};

      // Находим проект пользователя
      const project = projects.find(p => p.id === user.projectId);

      // Инициализируем все периоды нулями
      periods.forEach(period => {
        periodTotals[period] = 0;
      });

      // Суммируем часы по периодам
      user.timeEntries.forEach(entry => {
        const entryDate = parseISO(entry.date);

        if (!isValid(entryDate) || entryDate < startDate || entryDate > endDate) {
          return;
        }

        const periodKey = getPeriodKey(entryDate, periodType);
        if (periodKey && periodKey in periodTotals) {
          periodTotals[periodKey] += entry.hours;
        }
      });

      // Вычисляем общий итог для пользователя
      const total = Object.values(periodTotals).reduce((sum, hours) => sum + hours, 0);

      return {
        userId: user.id,
        userName: user.name,
        projectId: user.projectId,
        projectName: project ? project.name : 'Unknown Project',
        periods: periodTotals,
        total
      };
    });

    return { data, periods };
  }, [users, projects, periodType, startDate, endDate]);

  return {
    aggregatedData,
    periods,
  };
};
