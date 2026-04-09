import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Column,
  DataGridData,
  DataGridError,
  DataGridRowAction,
  DetailColumn,
  GetList,
  Order,
} from "src/types";
import { Loading, ErrorMsg } from "src/components/common";
import PageContainer from "../PageContainer/PageContainer";
import NoItems from "../NoItems";
import { CustomGrid } from "./content/utils";
import { TableContainer, Table } from "@mui/material";
import CustomTableHead from "./content/CustomTableHead";
import CustomTablePagination from "./content/CustomTablePagination";
import CustomTableBody from "./content/CustomTableBody";
import CustomTableToolbar from "./content/CustomTableToolbar";
import { formatNulls } from "src/utils/format";
import { SEARCH } from "src/constants";

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
    backgroundColor: "background.paper",
  },
};

interface DataGridProps {
  data: DataGridData;
  error: DataGridError;
  isFetching: boolean;
  columns: Column;
  detailColumns?: DetailColumn;
  hasCheckbox?: boolean;
  hasSearch?: boolean;
  searchPlaceholder?: string;
  initialQuery?: Partial<GetList>;
  onQueryChange?: (query: GetList) => void;
  toolbarElement?: ReactNode;
  rowActions?: DataGridRowAction[];
}

export default function DataGrid({
  data,
  error,
  isFetching,
  columns,
  detailColumns,
  hasCheckbox = true,
  hasSearch = true,
  searchPlaceholder,
  initialQuery,
  onQueryChange,
  toolbarElement,
  rowActions,
}: DataGridProps) {
  const [page, setPage] = useState(initialQuery?.page ?? 1);
  const [filter, setFilter] = useState(initialQuery?.filter ?? "");
  const [debouncedFilter, setDebouncedFilter] = useState(
    initialQuery?.filter ?? "",
  );
  const [collapseItem, setCollapseItem] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [order, setOrder] = useState<Order>(initialQuery?.order ?? "desc");
  const [orderBy, setOrderBy] = useState<string>(
    initialQuery?.orderBy ?? String(columns[0]?.id ?? "id"),
  );

  const items = data?.items ?? [];
  const isCollapsible = Boolean(detailColumns);
  const isServerMode = Boolean(onQueryChange);

  const handleSetFilter = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilter(filter);
    }, SEARCH.debounceMs);

    return () => clearTimeout(timeout);
  }, [filter]);

  const handleSetPage = (newPage: number) => {
    setPage(newPage);
  };

  const handleResetCollapseItems = () => {
    setCollapseItem("");
  };

  const handleToggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
      return;
    }
    setSelectedItems(items.map((item) => item.id));
  };

  const handleToggleCollapse = (id: string) => {
    setCollapseItem((prev) => (prev === id ? "" : id));
  };

  const handleSort = (columnId: string) => {
    if (orderBy === columnId) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setOrderBy(columnId);
    setOrder("asc");
  };

  useEffect(() => {
    if (!onQueryChange) return;
    onQueryChange({
      page,
      perPage: data?.perPage ?? initialQuery?.perPage ?? 20,
      filter: debouncedFilter,
      order,
      orderBy,
    });
  }, [
    data?.perPage,
    debouncedFilter,
    initialQuery?.perPage,
    onQueryChange,
    order,
    orderBy,
    page,
  ]);

  const filteredAndSortedItems = useMemo(() => {
    const lowerFilter = debouncedFilter.toLowerCase().trim();

    const filtered = lowerFilter
      ? items.filter((item) =>
          columns.some((column) => {
            const id = column.id as keyof typeof item;
            const rawValue = column.render
              ? column.render(item)
              : formatNulls(item[id]);
            return String(rawValue ?? "")
              .toLowerCase()
              .includes(lowerFilter);
          }),
        )
      : items;

    const sorted = [...filtered].sort((a, b) => {
      const valA = a[orderBy as keyof typeof a];
      const valB = b[orderBy as keyof typeof b];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return order === "asc" ? -1 : 1;
      if (valB === null || valB === undefined) return order === "asc" ? 1 : -1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return order === "asc" ? -1 : 1;
    });

    return sorted;
  }, [columns, debouncedFilter, items, order, orderBy]);

  const hasIgnorableError =
    !!error &&
    (() => {
      const errorText = JSON.stringify(error).toLowerCase();
      return errorText.includes("autocancel") || errorText.includes("aborted");
    })();

  const dataForRender = isServerMode
    ? data
    : data && filteredAndSortedItems
      ? {
          ...data,
          items: filteredAndSortedItems,
          totalItems: filteredAndSortedItems.length,
        }
      : data;

  return (
    <PageContainer>
      {hasSearch && (
        <CustomTableToolbar
          filter={filter}
          selectedCount={selectedItems.length}
          onSearch={handleSetFilter}
          searchPlaceholder={searchPlaceholder}
          toolbarElement={toolbarElement}
        />
      )}

      {dataForRender && dataForRender.items && dataForRender.items.length > 0 ? (
        <TableContainer
          sx={{
            flex: "1 1 auto",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Table
            stickyHeader
            sx={{
              borderCollapse: "separate",
              tableLayout: "fixed",
            }}
          >
            <CustomTableHead
              columns={columns}
              items={dataForRender.items}
              selectedItems={selectedItems}
              order={order}
              orderBy={orderBy}
              isCollapsible={isCollapsible}
              hasRowActions={Boolean(rowActions?.length)}
              hasCheckbox={hasCheckbox}
              handleSelectAll={handleSelectAll}
              handleSortTable={handleSort}
              styles={styles}
            />
            <CustomTableBody
              items={dataForRender.items}
              columns={columns}
              selectedItems={selectedItems}
              detailColumns={detailColumns}
              collapseItem={collapseItem}
              hasCheckbox={hasCheckbox}
              rowActions={rowActions}
              handleToggleSelect={handleToggleSelect}
              handleToggleCollapse={handleToggleCollapse}
              styles={styles}
            />
          </Table>
        </TableContainer>
      ) : dataForRender && dataForRender.items && dataForRender.items.length === 0 ? (
        <CustomGrid>
          <NoItems />
        </CustomGrid>
      ) : error && !hasIgnorableError ? (
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
        data={dataForRender}
        handleSetPage={handleSetPage}
        handleResetCollapseItems={handleResetCollapseItems}
      />
    </PageContainer>
  );
}
