import {
  TableRow,
  TableCell,
  Typography,
  Checkbox,
  TableSortLabel,
  TableHead,
} from "@mui/material";
import { useUI } from "src/hooks";
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
  const { isMobile } = useUI();
  const isAllSelected = items.length === selectedItems.length;
  const collapseColumnWidth = 48;
  const getActionsColumnWidth = (actionsCount: number) =>
    actionsCount > 0 ? actionsCount * 30 + (actionsCount - 1) * 4 + 16 : 0;
  const actionsColumnWidth = getActionsColumnWidth(rowActionsCount);
  const actionsStickySx = {
    position: "sticky",
    right: isCollapsible ? collapseColumnWidth : 0,
    zIndex: 3,
    backgroundColor: "#F8FAFC",
    backgroundImage: "none",
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
        ) : null}

        {columns.map((column, i) => {
          const id = column.id as keyof DataItem;
          const active = orderBy === id;
          const direction = orderBy === id ? order : "asc";

          return (
            <TableCell
              key={`${String(column.id)}-${i}`}
              variant="head"
              align={column.align ?? "right"}
              style={{
                width: isMobile
                  ? column.mobileWidth
                  : (column.width ?? column.minWidth),
              }}
              sx={{
                minWidth: isMobile ? 0 : column.minWidth,
              }}
              sortDirection={active ? direction : false}
            >
              <TableSortLabel
                active={active}
                direction={direction}
                onClick={() => handleSortTable(String(column.id))}
                disabled={column.disableSort}
                hideSortIcon
                sx={{
                  display: isMobile ? "flex" : "inline-flex",
                  minHeight: isMobile ? 0 : 24,
                  maxWidth: "100%",
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                  "& .MuiTableSortLabel-icon": {
                    color: "text.primary !important",
                  },
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {isMobile
                    ? (column.mobileLabel ?? column.label)
                    : column.label}
                </Typography>
              </TableSortLabel>
            </TableCell>
          );
        })}

        {hasRowActions && (
          <TableCell
            padding="none"
            aria-label="Acciones"
            align="center"
            sx={{ ...actionsStickySx, pl: 1, pr: 2 }}
          >
            {!isMobile && (
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.3 }}>
                Acciones
              </Typography>
            )}
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
              backgroundImage: "none",
              zIndex: 4,
            }}
          />
        )}
      </TableRow>
    </TableHead>
  );
}
