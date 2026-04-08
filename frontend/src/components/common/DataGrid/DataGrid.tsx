import { useState } from "react";
import { Column, DataGridData, DataGridError, Order } from "src/types";
import { Loading, ErrorMsg } from "src/components/common";
import PageContainer from "../PageContainer/PageContainer";
import NoItems from "../NoItems";
import { useAppDispatch } from "src/app/store";
import { CustomGrid } from "./content/utils";
import { TableContainer, Table } from "@mui/material";
import CustomTableHead from "./content/CustomTableHead";
import CustomTablePagination from "./content/CustomTablePagination";
import CustomTableBody from "./content/CustomTableBody";

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
}

export default function DataGrid({
  data,
  error,
  isFetching,
  columns,
}: DataGridProps) {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [collapseItems, setCollapseItem] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<string>("created");

  const handleSetFilter = (value: string) => {
    // TODO: debounce function here
    setFilter(value);
    setPage(1);
  };

  const handleSetPage = (newPage: number) => {
    setPage(newPage);
  };

  const handleResetCollapseItems = () => {
    setCollapseItem([]);
  };

  return (
    <PageContainer>
      {/* <Box pl={2} mb={1}>
        <Typography variant="h6">{translateTitle(route)}</Typography>
      </Box> */}
      {/* <CustomTableToolbar
        handleFetchItems={handleFetchItems}
        entity={entity}
        bulkActionForOne={bulkActionForOne}
        bulkActionForMany={bulkActionForMany}
        disableCreateBtn={disableCreateBtn}
        disableDefaultOptBtn={disableDefaultOptBtn}
      /> */}
      {data && data.items && data.items.length > 0 ? (
        <TableContainer sx={{ flex: "1 1 auto" }}>
          <Table
            stickyHeader
            sx={{
              borderCollapse: "separate",
              tableLayout: "fixed",
            }}
          >
            <CustomTableHead
              columns={columns}
              items={data?.items}
              selectedItems={selectedItems}
              order={order}
              orderBy={orderBy}
              isCollapsible={true}
              styles={styles}
            />
            <CustomTableBody
              items={data.items}
              columns={columns}
              selectedItems={selectedItems}
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
      <CustomTablePagination
        data={data}
        handleSetPage={handleSetPage}
        handleResetCollapseItems={handleResetCollapseItems}
      />
    </PageContainer>
  );
}
