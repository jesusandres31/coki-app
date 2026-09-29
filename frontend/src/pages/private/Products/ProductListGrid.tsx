import { useState } from "react";
import { useGetProductsListQuery } from "src/app/services/invoiceService";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import { DataGridRowAction, GetList } from "src/types";
import useProductListColumns from "./useProductListColumns";

interface ProductListGridProps {
  rowActions: DataGridRowAction[];
  createAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function ProductListGrid({
  rowActions,
  createAction,
}: ProductListGridProps) {
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));

  const { data, error, isFetching } = useGetProductsListQuery(queryArgs);
  const { columns, isFetchingLookups } = useProductListColumns();
  const isLoadingProductGridData = isFetching || isFetchingLookups;

  return (
    <DataGrid
      data={data}
      error={error}
      isFetching={isLoadingProductGridData}
      columns={columns}
      hasSearch
      searchPlaceholder="Buscar producto"
      initialQuery={queryArgs}
      onQueryChange={setQueryArgs}
      rowActions={rowActions}
      createAction={createAction}
    />
  );
}
