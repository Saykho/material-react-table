export interface TimeEntry {
  date: string; // YYYY-MM-DD format
  hours: number;
}

export interface User {
  id: string;
  name: string;
  projectId: number;
  timeEntries: TimeEntry[];
}

export interface Project {
  id: number;
  name: string;
  color: string;
}

export type PeriodType = 'day' | 'week' | 'month';

export interface AggregatedData {
  userId: string;
  userName: string;
  projectId: number;
  projectName: string;
  periods: { [key: string]: number }; // key is period identifier, value is total hours
  total: number;
}

export interface CellModalData {
  value: number;
  row: AggregatedData;
  period: string;
}
