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
  const totalItems = data?.totalItems ?? 0;
  const perPage = data?.perPage ?? 0;
  const totalPages =
    data?.totalPages ??
    (perPage > 0 ? Math.max(1, Math.ceil(totalItems / perPage)) : 0);
  const currentPage = totalItems > 0 ? (data?.page ?? 1) : 0;

  const handleChangePage = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number,
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
        rowsPerPageOptions={[perPage]}
        count={totalItems}
        rowsPerPage={perPage}
        page={
          // - 1 because pagination starts at 0 in MUI TablePagination.
          totalItems <= 0 ? 0 : currentPage - 1
        }
        onPageChange={handleChangePage}
        labelDisplayedRows={(info) => {
          return (
            <Typography
              component="span"
              variant="subtitle2"
              color="text.primary"
            >
              {`Results ${info.from} - ${
                info.to === -1 ? info.count : info.to
              }, ${"of"} ${totalItems} items | Page ${currentPage} of ${totalPages}`}
            </Typography>
          );
        }}
        // onRowsPerPageChange={() => {}}
        sx={{
          backgroundColor: "background.paper",
          "& .MuiTablePagination-toolbar": {
            minHeight: 44,
            px: { xs: 1, sm: 2 },
          },
        }}
      />
    </Grid>
  );
}
