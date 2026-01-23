/**
 * Table - TanStack Table 기반 테이블 컴포넌트
 *
 * TanStack Table v8을 사용한 테이블 컴포넌트입니다.
 * 정렬, 필터링, 페이지네이션 등 다양한 기능을 지원합니다.
 */

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import tw from 'tailwind-styled-components';

export interface TableProps<T> {
  /** 테이블 컬럼 정의 */
  columns: ColumnDef<T, any>[];
  /** 테이블 데이터 */
  data: T[];
  /** 행 클릭 이벤트 핸들러 */
  onRowClick?: (row: T) => void;
}

export function Table<T>({ columns, data, onRowClick }: TableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableContainer>
      <TableElement>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHeaderCell
                  key={header.id}
                  style={{
                    width:
                      header.getSize() !== 150 ? header.getSize() : undefined,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              $clickable={!!onRowClick}
            >
              {row.getVisibleCells().map((cell) => (
                <TableDataCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableDataCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableElement>
    </TableContainer>
  );
}

const TableContainer = tw.div`
  overflow-x-auto
  bg-white
`;

const TableElement = tw.table`
  min-w-full
`;

const TableHeader = tw.thead`
  border-b
  border-gray-200
`;

const TableRow = tw.tr<{ $clickable?: boolean }>`
  border-b
  border-gray-100
  ${(p) => p.$clickable && 'hover:bg-gray-50 cursor-pointer transition-colors'}
`;

const TableHeaderCell = tw.th`
  px-4
  py-3
  text-left
  text-xs
  font-medium
  text-gray-500
`;

const TableBody = tw.tbody`
  bg-white
`;

const TableDataCell = tw.td`
  px-4
  py-3
  whitespace-nowrap
  text-sm
  text-gray-900
`;
