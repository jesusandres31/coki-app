import { useUI } from "src/hooks";
import React from "react";
import { Box, Divider, Grid, TablePagination, Typography } from "@mui/material";
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
  const { isMobile } = useUI();
  const totalItems = data?.totalItems ?? 0;
  const perPage = data?.perPage || 20;
  const totalPages =
    data?.totalPages ??
    (perPage > 0 ? Math.max(1, Math.ceil(totalItems / perPage)) : 0);
  const currentPage = totalItems > 0 ? (data?.page ?? 1) : 0;
  const renderNumber = (value: number) => (
    <Box component="span" sx={{ color: "common.black", fontWeight: 700 }}>
      {value}
    </Box>
  );

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
          const lastItem = info.to === -1 ? info.count : info.to;
          return (
            <Typography
              component="span"
              variant="subtitle2"
              color="text.primary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {isMobile ? (
                <>
                  {renderNumber(info.from)}–{renderNumber(lastItem)} de{" "}
                  {renderNumber(totalItems)}
                </>
              ) : (
                <>
                  Resultados {renderNumber(info.from)}–{renderNumber(lastItem)}{" "}
                  de {renderNumber(totalItems)} elementos | Página{" "}
                  {renderNumber(currentPage)} de {renderNumber(totalPages)}
                </>
              )}
            </Typography>
          );
        }}
        // onRowsPerPageChange={() => {}}
        sx={{
          backgroundColor: "background.paper",
          "& .MuiTablePagination-spacer": {
            display: { xs: "none", sm: "block" },
          },
          "& .MuiTablePagination-actions": {
            display: { xs: "contents", sm: "flex" },
            ml: { sm: 2 },
            "& button": {
              width: 32,
              height: 32,
            },
            "& button:first-of-type": {
              gridColumn: { xs: 1 },
              gridRow: { xs: 1 },
            },
            "& button:last-of-type": {
              gridColumn: { xs: 3 },
              gridRow: { xs: 1 },
            },
          },
          "& .MuiTablePagination-displayedRows": {
            gridColumn: { xs: 2 },
            gridRow: { xs: 1 },
            justifySelf: { xs: "center", sm: "auto" },
          },
          "& .MuiTablePagination-toolbar": {
            minHeight: 40,
            display: { xs: "grid", sm: "flex" },
            gridTemplateColumns: { xs: "32px minmax(0, 1fr) 32px" },
            justifyContent: { xs: "center", sm: "flex-end" },
            flexWrap: { sm: "wrap" },
            px: { xs: 2, sm: 2 },
          },
        }}
      />
    </Grid>
  );
}
