import React from "react";
import { Divider, Grid, TablePagination, Typography } from "@mui/material";
import { DataItem } from "src/types";
import { ListResult } from "pocketbase";

interface CustomTablePaginationProps {
  data: ListResult<DataItem> | undefined;
  handleSetPage: (newPage: number) => void;
  handleResetCollapseItems: () => void;
  isCollapsed?: boolean;
}

export default function CustomTablePagination({
  data,
  handleSetPage,
  handleResetCollapseItems,
  isCollapsed = false,
}: CustomTablePaginationProps) {
  const handleChangePage = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number
  ) => {
    // because pagination starts at 0 in MUI TablePagination.
    handleSetPage(newPage + 1);
    if (isCollapsed) handleResetCollapseItems();
  };

  return (
    <Grid container justifyContent="center" flexDirection="column">
      {!isCollapsed && <Divider />}
      <TablePagination
        component="div"
        rowsPerPageOptions={[data?.perPage || 0]}
        count={data?.totalItems || 0}
        rowsPerPage={data?.perPage || 0}
        page={
          // - 1 because pagination starts at 0 in MUI TablePagination.
          !data?.totalItems || data?.totalItems <= 0 ? 0 : data?.page - 1
        }
        onPageChange={handleChangePage}
        labelDisplayedRows={(info) => {
          return (
            <Typography
              component="span"
              variant="subtitle2"
              color="text.secondary"
            >
              {`Results ${info.from} - ${
                info.to === -1 ? info.count : info.to
              }, ${"of"} ${data?.totalItems} items`}
            </Typography>
          );
        }}
        // onRowsPerPageChange={() => {}}
      />
    </Grid>
  );
}
