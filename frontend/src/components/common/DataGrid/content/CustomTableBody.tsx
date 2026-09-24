import { useUI } from "src/hooks";
import React from "react";
import {
  Column,
  DataGridRowAction,
  DetailColumn,
  IColumn,
  DataItem,
} from "src/types";
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
  const getActionsColumnWidth = (actionsCount: number) =>
    actionsCount > 0 ? actionsCount * 30 + (actionsCount - 1) * 4 + 16 : 0;
  const actionsColumnWidth = getActionsColumnWidth(rowActions.length);
  const tableIconButtonSx = {
    width: 30,
    height: 30,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1.25,
    p: 0.5,
  };
  const actionsStickySx = {
    position: "sticky",
    right: isCollapsible ? 48 : 0,
    zIndex: 1,
    backgroundColor: "transparent",
    backgroundImage: "none",
    width: actionsColumnWidth,
    minWidth: actionsColumnWidth,
    maxWidth: actionsColumnWidth,
    boxSizing: "border-box",
  };

  const isSelected = (selectedItems: string[], itemId: string) => {
    return selectedItems.some((selectedItem) => selectedItem === itemId);
  };

  return (
    <TableBody>
      {items.map((row, index) => {
        const selected = isSelected(selectedItems, row.id);
        const collapsed = collapseItem === row.id;

        return (
          <React.Fragment key={row.id}>
            <TableRow
              selected={selected}
              sx={{
                "& > th, & > td": {
                  backgroundColor: "background.paper",
                  backgroundImage: "none",
                  borderBottom: collapsed ? "0px" : "1px solid",
                  borderColor: "divider",
                },
                "& > .row-sticky-cell": {
                  backgroundColor: "transparent",
                  backgroundImage: "none",
                },
                "&:hover > th, &:hover > td": {
                  backgroundColor: "background.paper",
                  backgroundImage: (theme) =>
                    `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
                },
                "&:hover > .row-sticky-cell": {
                  backgroundColor: "transparent",
                  backgroundImage: "none",
                },
                "&.Mui-selected > th, &.Mui-selected > td": {
                  backgroundColor: "background.paper",
                  backgroundImage: (theme) =>
                    `linear-gradient(${theme.palette.action.selected}, ${theme.palette.action.selected})`,
                },
                "&.Mui-selected > .row-sticky-cell": {
                  backgroundColor: "transparent",
                  backgroundImage: "none",
                },
                "&.Mui-selected:hover > th, &.Mui-selected:hover > td": {
                  backgroundColor: "background.paper",
                  backgroundImage: (theme) =>
                    `linear-gradient(${theme.palette.action.selected}, ${theme.palette.action.selected})`,
                },
                "&.Mui-selected:hover > .row-sticky-cell": {
                  backgroundColor: "transparent",
                  backgroundImage: "none",
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
              ) : null}

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
                    sx={{
                      width: isMobile
                        ? column.mobileWidth
                        : (column.width ?? column.minWidth),
                      minWidth: isMobile ? 0 : column.minWidth,
                      cursor: isCollapsible ? "pointer" : "default",
                      py: 0.5,
                    }}
                    onClick={() =>
                      isCollapsible ? handleToggleCollapse(row.id) : undefined
                    }
                  >
                    {/* <Tooltip title={tooltip !== NULL_VAL && tooltip}> */}
                    <Typography
                      variant="body2"
                      component="div"
                      color="text.primary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace:
                          isMobile && column.type !== "number"
                            ? "normal"
                            : "nowrap",
                        overflowWrap: "anywhere",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        "& .MuiChip-root": { maxWidth: "100%" },
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
                  sx={{
                    py: 0.25,
                    pl: 1,
                    pr: 1,
                    ...actionsStickySx,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={0.5}
                  >
                    {rowActions.map((action) => (
                      <Tooltip
                        key={action.id}
                        title={
                          isMobile
                            ? (action.mobileLabel ?? action.label)
                            : action.label
                        }
                      >
                        <IconButton
                          aria-label={
                            isMobile
                              ? (action.mobileLabel ?? action.label)
                              : action.label
                          }
                          onClick={() => action.onClick(row)}
                          sx={{
                            ...tableIconButtonSx,
                          }}
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
                    ...styles.sticky,
                    py: 0.25,
                    pr: 2,
                  }}
                  onClick={() => handleToggleCollapse(row.id)}
                >
                  <IconButton
                    aria-label={
                      collapsed ? "Ocultar productos" : "Mostrar productos"
                    }
                    aria-expanded={collapsed}
                    sx={{
                      width: 30,
                      height: 30,
                      p: 0.5,
                      pr: 1,
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
                  (hasCheckbox ? 1 : 0) +
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
