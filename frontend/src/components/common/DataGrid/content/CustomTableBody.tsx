import React from "react";
import { Column, DetailColumn, IColumn, DataItem } from "src/types";
import { useUI } from "src/hooks";
import {
  TableCell,
  Typography,
  Checkbox,
  IconButton,
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
  collapseItem: string;
  hasCheckbox?: boolean;
  handleToggleSelect: (id: string) => void;
  handleToggleCollapse: (id: string) => void;
  styles?: any;
}

export default function CustomTableBody({
  items,
  columns,
  selectedItems,
  detailColumns,
  collapseItem,
  hasCheckbox = false,
  handleToggleSelect,
  handleToggleCollapse,
  styles,
}: CustomTableBodyProps) {
  const { isMobile } = useUI();
  const isCollapsible = Boolean(detailColumns);

  const isSelected = (selectedItems: string[], itemId: string) => {
    return selectedItems.some((selectedItem) => selectedItem === itemId);
  };

  return (
    <TableBody>
      {items.map((row, index) => {
        const selected = isSelected(selectedItems, row.id);
        const collapsed = collapseItem === row.id;

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
                  onClick={() => handleToggleSelect(row.id)}
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
                    height={52}
                    component="th"
                    scope="row"
                    size="small"
                    key={`${column.id}-${i}`}
                    align={column.align ?? "right"}
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      isCollapsible ? handleToggleCollapse(row.id) : undefined
                    }
                  >
                    {/* <Tooltip title={tooltip !== NULL_VAL && tooltip}> */}
                    <Typography
                      variant="body2"
                      noWrap
                      color="text.primary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
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
                  onClick={() => handleToggleCollapse(row.id)}
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
