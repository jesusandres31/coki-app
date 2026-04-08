import React from "react";
import { Column, DetailColumn, IColumn, DataItem } from "src/types";
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
  items: DataItem[];
  columns: Column;
  selectedItems: string[];
  detailColumns?: DetailColumn;
  hasCheckbox?: boolean;
  styles?: any;
}

export default function CustomTableBody({
  items,
  columns,
  selectedItems,
  detailColumns,
  hasCheckbox = false,
  styles,
}: CustomTableBodyProps) {
  const dispatch = useAppDispatch();
  const { isMobile } = useUI();
  const theme = useTheme();
  const isCollapsible = Boolean(detailColumns);

  const handleClickRowItem = (item: DataItem) => {
    /* if (handleClickRow) {
      handleClickRow(item);
    } else {
      dispatch(setSelectedItems(item.id));
    } */
  };

  const handleCollapse = (id: string) => {
    /*  if (id === collapseItem) {
      dispatch(resetCollapse());
    } else {
      dispatch(setCollapseItem(id));
    } */
  };

  const isCollapsed = (collapseItem: string, itemId: string) => {
    return collapseItem === itemId;
  };

  const isSelected = (selectedItems: string[], itemId: string) => {
    return selectedItems.some((selectedItem) => selectedItem === itemId);
  };

  return (
    <TableBody>
      {items.map((row, index) => {
        const selected = isSelected(selectedItems, row.id);
        // const collapsed = isCollapsed(collapseItem, row.id);
        const collapsed = false;

        return (
          <React.Fragment key={`${index}-${row.id}`}>
            <TableRow
              selected={selected}
              sx={{
                "& > *": { borderBottom: collapsed ? "0px" : "unset" },
              }}
            >
              {hasCheckbox ? (
                <TableCell
                  padding="checkbox"
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleClickRowItem(row)}
                >
                  <Checkbox color="primary" size="small" checked={selected} />
                </TableCell>
              ) : (
                <TableCell padding="checkbox" sx={{ width: 0 }} />
              )}

              {(columns as IColumn<DataItem>[]).map((column, i) => {
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
                        : handleClickRowItem(row)
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
