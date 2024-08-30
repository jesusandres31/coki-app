import React from "react";
import { Column, DetailColumn, IColumn, Item } from "src/types";
import {
  isCollapsed,
  isSelected,
  resetCollapse,
  setCollapseItem,
  setSelectedItems,
  useUISelector,
} from "src/slices/ui/uiSlice";
import { useAppDispatch } from "src/app/store";
import { useUI } from "src/hooks";
import {
  TableCell,
  Typography,
  Checkbox,
  IconButton,
  lighten,
  useTheme,
  TableRow,
  TableBody,
} from "@mui/material";
import { formatNulls, renderValue } from "src/utils/format";
import {
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
} from "@mui/icons-material";
import CustomCollapse from "./Collapse/CustomCollapse";

interface CustomTableBodyProps {
  items: Item[];
  columns: Column;
  detailColumns?: DetailColumn;
  styles: any;
}

export default function CustomTableBody({
  items,
  columns,
  detailColumns,
  styles,
}: CustomTableBodyProps) {
  const dispatch = useAppDispatch();
  const { selectedItems, collapseItem } = useUISelector((state) => state.ui);
  const { isMobile } = useUI();
  const theme = useTheme();
  const isCollapsible = Boolean(detailColumns);

  const handleSelectItem = (itemId: string) => {
    dispatch(setSelectedItems(itemId));
    // dispatch(resetCollapse());
  };

  const handleCollapse = (id: string) => {
    if (id === collapseItem) {
      dispatch(resetCollapse());
    } else {
      dispatch(setCollapseItem(id));
    }
  };

  return (
    <TableBody>
      {items.map((row, index) => {
        const selected = isSelected(selectedItems, row.id);
        const collapsed = isCollapsed(collapseItem, row.id);

        return (
          <React.Fragment key={`${index}-${row.id}`}>
            <TableRow
              selected={selected}
              sx={{
                "& > *": { borderBottom: collapsed ? "0px" : "unset" },
              }}
            >
              <TableCell
                padding="checkbox"
                sx={{ cursor: "pointer" }}
                onClick={() => handleSelectItem(row.id)}
              >
                <Checkbox color="primary" size="small" checked={selected} />
              </TableCell>

              {(columns as IColumn<Item>[]).map((column, i) => {
                const value = column.render
                  ? column.render(row)
                  : formatNulls(row[column.id]);

                // const tooltip = column.tooltip ? column.tooltip(row) : value;

                const isEmail = (column.id as any) === "email";

                return (
                  <TableCell
                    height={50}
                    component="th"
                    scope="row"
                    size="small"
                    key={`${column.id}-${i}`}
                    align={column.align ?? "right"}
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      isCollapsible
                        ? handleCollapse(row.id)
                        : handleSelectItem(row.id)
                    }
                  >
                    {/* <Tooltip title={tooltip !== NULL_VAL && tooltip}> */}
                    <Typography
                      variant="subtitle2"
                      noWrap
                      color={lighten(theme.palette.text.primary, 0.2)}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isEmail ? value : renderValue(value)}
                    </Typography>
                    {/* </Tooltip> */}
                  </TableCell>
                );
              })}

              {isCollapsible ? (
                <TableCell
                  align="right"
                  sx={isMobile ? styles.stickyMobile : styles.sticky}
                  onClick={() => handleCollapse(row.id)}
                >
                  <IconButton>
                    {collapsed ? (
                      <KeyboardArrowUpRounded />
                    ) : (
                      <KeyboardArrowDownRounded />
                    )}
                  </IconButton>
                </TableCell>
              ) : null}
            </TableRow>

            <CustomCollapse
              columnsLength={columns.length}
              detailColumns={detailColumns}
              styles={styles}
              collapsed={collapsed}
              row={row}
            />
          </React.Fragment>
        );
      })}
    </TableBody>
  );
}
