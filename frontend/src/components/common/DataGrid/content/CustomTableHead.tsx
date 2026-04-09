import {
  TableRow,
  TableCell,
  Typography,
  Checkbox,
  TableSortLabel,
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
  hasRowActions?: boolean;
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
  hasCheckbox = false,
  handleSelectAll,
  handleSortTable,
  styles,
}: CustomTableHeadProps) {
  const { isMobile } = useUI();
  const isAllSelected = items.length === selectedItems.length;

  return (
    <TableHead>
      <TableRow>
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
                sx={{
                  "& .MuiTableSortLabel-icon": {
                    color: "text.secondary !important",
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

        {hasRowActions && <TableCell padding="checkbox" />}

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
