import {
  TableRow,
  TableCell,
  Typography,
  Checkbox,
  TableSortLabel,
  useTheme,
  TableHead,
} from "@mui/material";
import { Column, DataItem, Order } from "src/types";
import { useUI } from "src/hooks";

interface CustomTableHeadProps {
  columns: Column;
  items: DataItem[];
  selectedItems: string[];
  order: Order;
  orderBy: string;
  isCollapsible: boolean;
  hasCheckbox?: boolean;
  styles?: any;
}

export default function CustomTableHead({
  columns,
  items,
  selectedItems,
  order,
  orderBy,
  isCollapsible,
  hasCheckbox = false,
  styles,
}: CustomTableHeadProps) {
  const theme = useTheme();
  const { isMobile } = useUI();
  const isAllSelected = items.length === selectedItems.length;

  const handleSelectAll = () => {
    /* if (isAllSelected) return dispatch(resetSelectedItems());
    if (items) return dispatch(setSelectedItems(items.map((item) => item.id))); */
  };

  const handleSortTable = (columnId: string) => {};

  return (
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: theme.palette.background.default,
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
              style={{ width: column.minWidth }}
              sortDirection={direction}
            >
              <TableSortLabel
                active={active}
                direction={direction}
                onClick={() => handleSortTable(String(column.id))}
                disabled={column.disableSort}
              >
                <Typography variant="body2" fontWeight="bold">
                  {column.label}
                </Typography>
              </TableSortLabel>
            </TableCell>
          );
        })}

        {isCollapsible && (
          <TableCell
            padding="checkbox"
            sx={isMobile ? styles.stickyMobile : styles.sticky}
          />
        )}
      </TableRow>
    </TableHead>
  );
}
