import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

interface TableLoadingSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function TableLoadingSkeleton({
  columns = 5,
  rows = 6,
}: TableLoadingSkeletonProps) {
  const safeColumns = Math.max(1, columns);
  const safeRows = Math.max(1, rows);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ width: "100%", height: "100%" }}
      >
        <Table
          size="small"
          aria-label="loading table"
          sx={{ width: "100%", tableLayout: "fixed" }}
        >
        <TableHead>
          <TableRow>
            {Array.from({ length: safeColumns }).map((_, index) => (
              <TableCell
                key={`header-${index}`}
                sx={{ width: `${100 / safeColumns}%` }}
              >
                <Skeleton variant="rounded" height={18} width="100%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: safeRows }).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from({ length: safeColumns }).map((__, cellIndex) => (
                <TableCell
                  key={`cell-${rowIndex}-${cellIndex}`}
                  sx={{ width: `${100 / safeColumns}%` }}
                >
                  <Box sx={{ py: 0.25 }}>
                    <Skeleton
                      variant="rounded"
                      height={20}
                      width="100%"
                      sx={{ display: "block" }}
                    />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
