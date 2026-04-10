import { DetailColumn, IColumn, IDetailColumn, DataItem } from "src/types";
import { useUI } from "src/hooks";
import {
  TableCell,
  Typography,
  TableHead,
  useTheme,
  TableRow,
  TableBody,
  Table,
  Box,
  Collapse,
  darken,
} from "@mui/material";
import { formatNulls, renderValue } from "src/utils/format";
import NoItems from "../../../NoItems";
import { CustomGrid } from "./../utils";

interface CustomCollapseProps {
  colSpan: number;
  detailColumns?: DetailColumn;
  styles: any;
  collapsed: boolean;
  row: DataItem;
}

export default function CustomCollapse({
  colSpan,
  detailColumns,
  styles,
  collapsed,
  row,
}: CustomCollapseProps) {
  const { isMobile } = useUI();
  const theme = useTheme();

  if (!detailColumns?.length) return null;

  return (
    <TableRow>
      <TableCell
        sx={{
          paddingBottom: 0,
          paddingTop: 0,
          borderInline: "none",
          borderBlock: collapsed ? "" : "none",
        }}
        colSpan={colSpan}
      >
        <Collapse in={collapsed} timeout="auto" unmountOnExit>
          {(detailColumns as IDetailColumn<DataItem, DataItem>[]).map(
            (detailCol, i) => {
              const detailRows = row[detailCol.id];

              return (
                <Box key={`${detailCol.id}-${i}`} py={1} sx={{ pb: 5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    {/* <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{
                        // fontStyle: "italic",
                        pl: 6,
                      }}
                    >
                      {`${detailCol.title}:`}
                    </Typography> */}
                  </Box>
                  {Array.isArray(detailRows) &&
                  (detailRows[0] === null ||
                    (detailRows && detailRows.length === 0)) ? (
                    <CustomGrid>
                      <NoItems />
                    </CustomGrid>
                  ) : Array.isArray(detailRows) &&
                    detailRows &&
                    detailRows.length > 0 ? (
                    <Box sx={{ width: "100%" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {detailCol.columns &&
                              detailCol.columns.map((column, i) => (
                                <TableCell
                                  size="small"
                                  key={`${column.id}-${i}`}
                                  align={column.align ?? "right"}
                                >
                                  {column.label}
                                </TableCell>
                              ))}
                            <TableCell
                              padding="checkbox"
                              sx={
                                isMobile ? styles.stickyMobile : styles.sticky
                              }
                            />
                          </TableRow>
                        </TableHead>

                        <TableBody
                          key={`${i}-${row.id}`}
                          sx={{ width: "100%" }}
                        >
                          {Array.isArray(detailRows) &&
                            detailRows.map((item, i) => (
                              <TableRow key={`${item.id}-${i}`}>
                                {(detailCol.columns as IColumn<DataItem>[]).map(
                                  (column) => {
                                    const value = column.render
                                      ? column.render(item)
                                      : formatNulls(item[column.id]);

                                    return (
                                      <TableCell
                                        component="th"
                                        scope="item"
                                        key={`${column.id}-${i}`}
                                        align={column.align ?? "right"}
                                        sx={{
                                          borderColor: darken(
                                            theme.palette.background.default,
                                            0.05,
                                          ),
                                        }}
                                      >
                                        {renderValue(value)}
                                      </TableCell>
                                    );
                                  },
                                )}
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </Box>
                  ) : null}
                </Box>
              );
            },
          )}
        </Collapse>
      </TableCell>
    </TableRow>
  );
}
