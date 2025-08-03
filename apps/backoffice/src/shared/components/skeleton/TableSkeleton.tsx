import tw from 'tailwind-styled-components';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <Container>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableHeaderCell key={index}>
                <Skeleton $width="60%" />
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableDataCell key={colIndex}>
                  <Skeleton $width={colIndex === 0 ? '80%' : '60%'} />
                </TableDataCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

const Container = tw.div`
  overflow-hidden 
  bg-white 
  shadow-sm 
  ring-1 
  ring-gray-900/5 
  rounded-lg
`;

const Table = tw.table`
  min-w-full 
  divide-y 
  divide-gray-300
`;

const TableHeader = tw.thead`
  bg-gray-50
`;

const TableRow = tw.tr``;

const TableHeaderCell = tw.th`
  px-6 
  py-3 
  text-left
`;

const TableBody = tw.tbody`
  divide-y 
  divide-gray-200 
  bg-white
`;

const TableDataCell = tw.td`
  px-6 
  py-4
`;

const Skeleton = tw.div<{ $width?: string }>`
  h-4 
  bg-gray-200 
  rounded 
  animate-pulse
  ${(p) => p.$width && `w-[${p.$width}]`}
`;
