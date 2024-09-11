import {
  TableRow,
  TableCell,
  Typography,
  Checkbox,
  TableSortLabel,
  useTheme,
  TableHead,
} from "@mui/material";
import { Column, Item, Order } from "src/types";
import { useAuth, useUI } from "src/hooks";
import {
  resetSelectedItems,
  setOrderBy,
  setSelectedItems,
  toggleSortDirection,
  useUISelector,
} from "src/slices/ui/uiSlice";
import { useAppDispatch } from "src/app/store";

interface CustomTableHeadProps {
  columns: Column;
  items: Item[];
  handleFetchItems: (
    page: number,
    perPage: number,
    filter: string,
    order: Order,
    orderBy: string,
    currentStore?: string
  ) => Promise<void>;
  isCollapsible: boolean;
  styles: any;
}

export default function CustomTableHead({
  columns,
  items,
  handleFetchItems,
  isCollapsible,
  styles,
}: CustomTableHeadProps) {
  const dispatch = useAppDispatch();
  const { currentStore } = useAuth();
  const { selectedItems, filter, order, orderBy, page, perPage } =
    useUISelector((state) => state.ui);
  const theme = useTheme();
  const { isMobile } = useUI();
  const isAllSelected = items.length === selectedItems.length;

  const handleSelectAll = () => {
    if (isAllSelected) return dispatch(resetSelectedItems());
    if (items) return dispatch(setSelectedItems(items.map((item) => item.id)));
  };

  const handleSortTable = (columnId: string) => {
    const newOrder =
      orderBy === columnId ? (order === "asc" ? "desc" : "asc") : "desc";
    if (orderBy === columnId) {
      dispatch(toggleSortDirection());
    } else {
      dispatch(setOrderBy(columnId));
    }
    handleFetchItems(page, perPage, filter, newOrder, columnId, currentStore);
  };

  return (
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: theme.palette.background.default,
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            size="small"
            checked={(items && items.length > 0 && isAllSelected) ?? false}
            indeterminate={selectedItems.length > 0 && !isAllSelected}
            onChange={handleSelectAll}
          />
        </TableCell>

        {columns.map((column, i) => {
          const id = column.id as keyof Item;
          const active = orderBy === id;
          const direction = orderBy === id ? order : "asc";

          return (
            <TableCell
              key={`${id}-${i}`}
              variant="head"
              align={column.align ?? "right"}
              style={{ width: column.minWidth }}
              sortDirection={direction}
            >
              <TableSortLabel
                active={active}
                direction={direction}
                onClick={() => handleSortTable(id)}
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
