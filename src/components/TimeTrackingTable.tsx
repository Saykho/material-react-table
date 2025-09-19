import React, {useState, useMemo, useRef} from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnVirtualizer,
} from 'material-react-table';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Dialog,
  DialogContent,
} from '@mui/material';
import type { PeriodType, AggregatedData, CellModalData } from '../types';
import {mockUsers, mockProjects} from '../mockData';
import { useDateRange, useAggregatedData, useTableCalculations } from '../hooks';

const TimeTrackingTable: React.FC = () => {
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [grouping, setGrouping] = useState<string[]>(['projectName']);
  const [open, setOpen] = useState<boolean>(false);
  const [cellData, setCellData] = useState<CellModalData | null>(null);

  // Используем последние 60 дней для демонстрации
  const { startDate, endDate } = useDateRange(364);

  // Агрегируем данные на основе выбранного периода
  const { aggregatedData, periods } = useAggregatedData({
    users: mockUsers,
    projects: mockProjects,
    periodType,
    startDate,
    endDate,
  });

  // Вычисляем итоги по периодам
  const { periodTotals, grandTotal, tableData } = useTableCalculations({
    aggregatedData,
  });

  const defaultPinned = ['mrt-row-expand', 'projectName', 'userName', 'total'];

  const columnPinning = useMemo(() => {
    return {
      left: defaultPinned.filter((col) => !grouping.includes(col)),
    };
  }, [grouping]);

  const columnVirtualizerInstanceRef = useRef<MRT_ColumnVirtualizer>(null);

  const handleCellClick = (value: number, row: AggregatedData, period: string) => {
    setCellData({ value, row, period });
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  // Создаем колонки таблицы
  const columns = useMemo<MRT_ColumnDef<AggregatedData>[]>(() => {
    const baseColumns: MRT_ColumnDef<AggregatedData>[] = [
      {
        accessorKey: 'projectName',
        header: 'Проект',
        size: 200,
        enableGrouping: true,
        Cell: ({ row }) => (
            <Box sx={{
              color: mockProjects.find(p => p.id === row.original.projectId)?.color || '#000',
              fontWeight: 'bold'
            }}>
              {row.original.projectName}
            </Box>
        ),
        Footer: () => '',
      },
      {
        accessorKey: 'userName',
        header: 'Пользователь',
        size: 200,
        enablePinning: true,
        enableGrouping: false,
        Footer: () => 'Итого:',
      },
    ];

    // Добавляем колонки для каждого периода
    const periodColumns: MRT_ColumnDef<AggregatedData>[] = periods.map(period => ({
      accessorFn: (row) => row.periods[period] || 0,
      id: period,
      header: period,
      size: 120,
      enableGrouping: false,
      aggregationFn: 'sum',
      AggregatedCell: ({ cell }) => {
        const value = cell.getValue<number>();
        return value > 0 ? `${value}ч` : '-';
      },
      Footer: () => {
        const periodTotal = periodTotals[period] || 0;
        return periodTotal > 0 ? `${periodTotal}ч` : '-';
      },
      Cell: ({ row }) => {
        const hours = row.original.periods[period] || 0;
        return (
            <Box sx={{ cursor: 'pointer' }} onClick={() => handleCellClick(hours, row.original, period)}>
              {hours > 0 ? `${hours}ч` : '-'}
            </Box>
        );
      },
    }));

    // Добавляем колонку итогов (всегда второй после имени пользователя)
    const totalColumn: MRT_ColumnDef<AggregatedData> = {
      accessorKey: 'total',
      header: 'Итого',
      size: 100,
      enablePinning: true,
      enableGrouping: false,
      aggregationFn: 'sum',
      AggregatedCell: ({ cell }) => {
        const value = cell.getValue<number>();
        return `${value}ч`;
      },
      Footer: () => `${grandTotal}ч`,
      Cell: ({ row }) => `${row.original.total}ч`,
    };

    return [...baseColumns, totalColumn, ...periodColumns];
  }, [periods, grandTotal, periodTotals]);

  // Используем хук useMaterialReactTable
  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnPinning: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableTableFooter: true,
    enablePagination: false,
    enableGrouping: true,
    enableExpanding: true,
    enableColumnVirtualization: true,
    groupedColumnMode: 'remove',
    positionExpandColumn: 'first',
    columnVirtualizerInstanceRef,
    columnVirtualizerOptions: { overscan: 5 },
    muiTableFooterCellProps: {
      sx: {
        '&[data-pinned="true"]': {
          opacity: 1,
        },
        fontWeight: 700,
        fontSize: '14px',
        backgroundColor: 'rgba(247, 247, 247, 1)',
      },
    },
    state: {
      grouping,
      columnPinning,
    },
    initialState: {
      expanded: true,
    },
    onGroupingChange: setGrouping,
    muiTableContainerProps: {
      sx: {
        height: 'calc(100vh - 200px)',
        // overflow: 'auto',
        overflowY: 'hidden',
        minHeight: '300px',
      }
    },
    displayColumnDefOptions: {
      'mrt-row-expand': {
        enableResizing: true,
        muiTableBodyCellProps: ({ row }) => ({
          sx: (theme) => ({
            color:
                row.depth === 0
                    ? theme.palette.primary.main
                    : row.depth === 1
                        ? theme.palette.secondary.main
                        : undefined,
            '&[data-pinned="true"]': {
              opacity: 1,
            },
          }),
        }),
        size: 200,
      },
    },
    muiTableBodyCellProps: {
      sx: {
        '&[data-pinned="true"]': {
          opacity: 1,
        },
      },
    },
    muiTableFooterProps: {
      sx: {
        opacity: 1,
      },
    },
  });

  return (
      <Paper sx={{ p: 2, width: '100vw', maxWidth: '100vw',  }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Отчет по времени сотрудников
          </Typography>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Период</InputLabel>
            <Select
                value={periodType}
                label="Период"
                onChange={(e) => setPeriodType(e.target.value as PeriodType)}
            >
              <MenuItem value="day">По дням</MenuItem>
              <MenuItem value="week">По неделям</MenuItem>
              <MenuItem value="month">По месяцам</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ width: '100%' }}>
          <MaterialReactTable table={table} />
        </Box>

        <Dialog open={open} onClose={handleModalClose}>
          <DialogContent>
            <Typography>Период: {cellData?.period}</Typography>
            <Typography>Пользователь: {cellData?.row.userName}</Typography>
            <Typography>Проект: {cellData?.row.projectName}</Typography>
            <Typography>Часы: {cellData?.value}ч</Typography>
          </DialogContent>
        </Dialog>
      </Paper>
  );
};

export default TimeTrackingTable;
