import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

interface Column<T> {
  key: string;
  header: string | ReactNode;
  render: (item: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id: number }>({
  columns,
  data,
  onRowClick,
}: TableProps<T>) {
  return (
    <TableContainer>
      <TableElement>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column.key} style={{ width: column.width }}>
                {column.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onRowClick?.(item)}
              $clickable={!!onRowClick}
            >
              {columns.map((column) => (
                <TableDataCell key={column.key}>
                  {column.render(item)}
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
  overflow-hidden 
  bg-white 
  shadow-sm 
  ring-1 
  ring-gray-900/5 
  rounded-lg
`;

const TableElement = tw.table`
  min-w-full 
  divide-y 
  divide-gray-300
`;

const TableHeader = tw.thead`
  bg-gray-50
`;

const TableRow = tw.tr<{ $clickable?: boolean }>`
  ${(p) => p.$clickable && 'hover:bg-gray-50 cursor-pointer transition-colors'}
`;

const TableHeaderCell = tw.th`
  px-6 
  py-3 
  text-left 
  text-xs 
  font-medium 
  text-gray-500 
  uppercase 
  tracking-wider
`;

const TableBody = tw.tbody`
  divide-y 
  divide-gray-200 
  bg-white
`;

const TableDataCell = tw.td`
  px-6 
  py-4 
  whitespace-nowrap 
  text-sm 
  text-gray-900
`;
