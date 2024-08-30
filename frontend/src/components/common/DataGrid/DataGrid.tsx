import { useEffect } from "react";
import {
  Column,
  DataGridData,
  DataGridError,
  DetailColumn,
  Entity,
  FetchItemsFunc,
  Order,
} from "src/types";
import { Loading, ErrorMsg } from "src/components/common";
import PageContainer from "./utils/PageContainer";
import NoItems from "../NoItems";
import { setPage, setSnackbar, useUISelector } from "src/slices/ui/uiSlice";
import { useAppDispatch } from "src/app/store";
import CustomTableToolbar from "./content/CustomTableToolbar";
import { CustomButtonProps, CustomGrid } from "./content/utils";
import { TableContainer, Table, Typography, Box } from "@mui/material";
import CustomTableHead from "./content/CustomTableHead";
import CustomTablePagination from "./content/CustomTablePagination";
import CustomTableBody from "./content/CustomTableBody";
import { translateTitle } from "src/utils/header";
import { useAuth, useRouter, useUI } from "src/hooks";

const styles = {
  sticky: {
    position: "sticky",
    paddingBlock: 0,
  },
  stickyMobile: {
    position: "sticky",
    paddingBlock: 0,
    right: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "white",
  },
};

interface DataGridProps {
  data: DataGridData;
  error: DataGridError;
  isFetching: boolean;
  columns: Column;
  detailColumns?: DetailColumn;
  entity: Entity;
  defaultOrderBy: string;
  fetchItemsFunc: FetchItemsFunc;
  bulkActionForOne?: CustomButtonProps[];
  bulkActionForMany?: CustomButtonProps[];
  disableCreateBtn?: boolean;
  disableDefaultOptBtn?: boolean;
}

export default function DataGrid({
  data,
  error,
  isFetching,
  columns,
  detailColumns,
  entity,
  defaultOrderBy,
  fetchItemsFunc,
  bulkActionForOne,
  bulkActionForMany,
  disableCreateBtn,
  disableDefaultOptBtn,
}: DataGridProps) {
  const dispatch = useAppDispatch();
  const { route } = useRouter();
  const { currentCanteen } = useAuth();
  const { filter, order, orderBy, page, perPage } = useUISelector(
    (state) => state.ui
  );
  const { resetTableState } = useUI();

  useEffect(() => {
    resetTableState(defaultOrderBy);
  }, []);

  useEffect(() => {
    // fetch in first render.
    if (orderBy && orderBy === defaultOrderBy) {
      handleFetchItems(page, perPage, filter, order, orderBy, currentCanteen);
    }
  }, [orderBy, page]);

  const handleFetchItems = async (
    page: number,
    perPage: number,
    filter: string,
    order: Order,
    orderBy: string,
    currentCanteen?: string
  ) => {
    try {
      await fetchItemsFunc({
        page,
        perPage,
        filter,
        order,
        orderBy,
        currentCanteen,
      });
    } catch (err: any) {
      dispatch(setSnackbar({ message: err.data.error, type: "error" }));
    }
  };

  return (
    <PageContainer>
      <Box pl={2} mb={1}>
        <Typography variant="h6">{translateTitle(route)}</Typography>
      </Box>
      <CustomTableToolbar
        handleFetchItems={handleFetchItems}
        entity={entity}
        bulkActionForOne={bulkActionForOne}
        bulkActionForMany={bulkActionForMany}
        disableCreateBtn={disableCreateBtn}
        disableDefaultOptBtn={disableDefaultOptBtn}
      />
      {data && data.items && data.items.length > 0 ? (
        <TableContainer sx={{ flex: "1 1 auto" }}>
          <Table
            sx={{
              borderCollapse: "separate",
              tableLayout: "fixed",
            }}
          >
            <CustomTableHead
              columns={columns}
              items={data?.items}
              handleFetchItems={handleFetchItems}
              isCollapsible={!!detailColumns}
              styles={styles}
            />
            <CustomTableBody
              items={data.items}
              columns={columns}
              detailColumns={detailColumns}
              styles={styles}
            />
          </Table>
        </TableContainer>
      ) : data && data.items && data.items.length === 0 ? (
        <CustomGrid>
          <NoItems />
        </CustomGrid>
      ) : error ? (
        <CustomGrid>
          <ErrorMsg />
        </CustomGrid>
      ) : isFetching ? (
        <CustomGrid>
          <Loading />
        </CustomGrid>
      ) : (
        <CustomGrid>
          <></>
        </CustomGrid>
      )}
      <CustomTablePagination data={data} setPage={setPage} />
    </PageContainer>
  );
}
