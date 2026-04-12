import React from "react";
import {
  Column,
  DataGridRowAction,
  DetailColumn,
  IColumn,
  DataItem,
} from "src/types";
import { useUI } from "src/hooks";
import {
  TableCell,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  Box,
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
  rowActions?: DataGridRowAction[];
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
  rowActions = [],
  handleToggleSelect,
  handleToggleCollapse,
  styles,
}: CustomTableBodyProps) {
  const { isMobile } = useUI();
  const isCollapsible = Boolean(detailColumns);
  const hasRowActions = rowActions.length > 0;
  const tableIconButtonSx = {
    width: 30,
    height: 30,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1.25,
    p: 0.5,
  };
  const actionsStickySx = isMobile
    ? {
        position: "sticky",
        right: isCollapsible ? 48 : 0,
        zIndex: 1,
        backgroundColor: "background.paper",
      }
    : undefined;

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
                "&:hover .row-sticky-cell": {
                  backgroundColor: "#F4F6FB",
                },
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
                    height={44}
                    component="th"
                    scope="row"
                    size="small"
                    key={`${column.id}-${i}`}
                    align={column.align ?? "right"}
                    sx={{ cursor: isCollapsible ? "pointer" : "default", py: 0.5 }}
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
                        fontWeight: 450,
                      }}
                    >
                      {isEmail ? value : renderValue(value)}
                    </Typography>
                    {/* </Tooltip> */}
                  </TableCell>
                );
              })}

              {hasRowActions ? (
                <TableCell
                  align="center"
                  className="row-sticky-cell"
                  sx={{ py: 0.25, ...actionsStickySx }}
                >
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    {rowActions.map((action) => (
                      <Tooltip key={action.id} title={action.label}>
                        <IconButton
                          onClick={() => action.onClick(row)}
                          sx={tableIconButtonSx}
                        >
                          {action.icon}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                </TableCell>
              ) : null}

              {isCollapsible ? (
                <TableCell
                  align="right"
                  className="row-sticky-cell"
                  sx={{
                    ...(isMobile ? styles.stickyMobile : styles.sticky),
                    py: 0.25,
                  }}
                  onClick={() => handleToggleCollapse(row.id)}
                >
                  <IconButton
                    sx={{
                      width: 30,
                      height: 30,
                      p: 0.5,
                      color: "primary.main",
                    }}
                  >
                    {collapsed ? (
                      <KeyboardArrowUpRounded />
                    ) : (
                      <KeyboardArrowDownRounded />
                    )}
                  </IconButton>
                </TableCell>
              ) : null}
            </TableRow>

            {isCollapsible ? (
              <CustomCollapse
                colSpan={
                  columns.length +
                  1 + // checkbox column (or its placeholder)
                  (hasRowActions ? 1 : 0) +
                  (isCollapsible ? 1 : 0)
                }
                detailColumns={detailColumns}
                styles={styles}
                collapsed={collapsed}
                row={row}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </TableBody>
  );
}

