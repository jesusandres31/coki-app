import {
  TableRow,
  TableCell,
  Typography,
  Checkbox,
  TableSortLabel,
  TableHead,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Column, DataItem, Order } from "src/types";

interface CustomTableHeadProps {
  columns: Column;
  items: DataItem[];
  selectedItems: string[];
  order: Order;
  orderBy: string;
  isCollapsible: boolean;
  hasRowActions?: boolean;
  rowActionsCount?: number;
  hasCheckbox?: boolean;
  handleSelectAll: () => void;
  handleSortTable: (columnId: string) => void;
  styles?: any;
}

export default function CustomTableHead({
  columns,
  items,
  selectedItems,
  order,
  orderBy,
  isCollapsible,
  hasRowActions = false,
  rowActionsCount = 0,
  hasCheckbox = false,
  handleSelectAll,
  handleSortTable,
  styles,
}: CustomTableHeadProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isAllSelected = items.length === selectedItems.length;
  const collapseColumnWidth = 48;
  const actionsColumnWidth =
    rowActionsCount > 0
      ? rowActionsCount * 30 + (rowActionsCount - 1) * 4 + 16
      : 56;
  const actionsStickySx = {
    position: "sticky",
    right: isCollapsible ? collapseColumnWidth : 0,
    zIndex: 3,
    backgroundColor: "#F8FAFC",
    width: actionsColumnWidth,
    minWidth: actionsColumnWidth,
    maxWidth: actionsColumnWidth,
    boxSizing: "border-box",
  };

  return (
    <TableHead>
      <TableRow
        sx={{
          "& .MuiTableCell-head": {
            py: 1,
          },
        }}
      >
        {hasCheckbox ? (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              size="small"
              checked={(items && items.length > 0 && isAllSelected) ?? false}
              indeterminate={selectedItems.length > 0 && !isAllSelected}
              onChange={handleSelectAll}
            />
          </TableCell>
        ) : (
          <TableCell padding="checkbox" sx={{ width: 0 }} />
        )}

        {columns.map((column, i) => {
          const id = column.id as keyof DataItem;
          const active = orderBy === id;
          const direction = orderBy === id ? order : "asc";

          return (
            <TableCell
              key={`${String(column.id)}-${i}`}
              variant="head"
              align={column.align ?? "right"}
              style={{ width: column.width ?? column.minWidth }}
              sx={{
                minWidth: column.minWidth,
              }}
              sortDirection={direction}
            >
              <TableSortLabel
                active={active}
                direction={direction}
                onClick={() => handleSortTable(String(column.id))}
                disabled={column.disableSort}
                sx={{
                  minHeight: 24,
                  "& .MuiTableSortLabel-icon": {
                    color: "text.primary !important",
                  },
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {column.label}
                </Typography>
              </TableSortLabel>
            </TableCell>
          );
        })}

        {hasRowActions && (
          <TableCell
            padding="none"
            align="center"
            sx={{ ...actionsStickySx, pl: 1, pr: 2 }}
          >
            <Typography variant="body2" fontWeight={700} sx={{ mt: 0.3 }}>
              {isMobile ? "Accs." : "Acciones"}
            </Typography>
          </TableCell>
        )}

        {isCollapsible && (
          <TableCell
            padding="none"
            sx={{
              ...(styles?.sticky ?? {}),
              width: collapseColumnWidth,
              minWidth: collapseColumnWidth,
              maxWidth: collapseColumnWidth,
              backgroundColor: "#F8FAFC",
              zIndex: 4,
            }}
          />
        )}
      </TableRow>
    </TableHead>
  );
}
