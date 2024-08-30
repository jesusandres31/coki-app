import React from "react";
import { Divider, Grid, TablePagination, Typography } from "@mui/material";
import { Item } from "src/types";
import { useAppDispatch } from "src/app/store";
import { ListResult } from "pocketbase";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { resetCollapse } from "src/slices/ui/uiSlice";

interface CustomTablePaginationProps {
  data: ListResult<Item> | undefined;
  setPage: ActionCreatorWithPayload<number, string>;
  isCollapsed?: boolean;
}

export default function CustomTablePagination({
  data,
  setPage,
  isCollapsed = false,
}: CustomTablePaginationProps) {
  const dispatch = useAppDispatch();

  const handleChangePage = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number
  ) => {
    // because pagination starts at 0 in MUI TablePagination.
    dispatch(setPage(newPage + 1));
    dispatch(resetCollapse());
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
