import { useMemo, useState } from "react";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import { useGetInvoicesViewQuery } from "src/app/services/invoiceService";
import { Column, DetailColumn, GetList } from "src/types";
import { VInvoicesResponse } from "src/types/pocketbase-types";
import { formatDate, formatMoney } from "src/utils/format";

export default function Invoices() {
  const [queryArgs, setQueryArgs] = useState<GetList>(
    () => ({ ...getListArgsInitialState, orderBy: "date" }),
  );

  const { data, error, isFetching } = useGetInvoicesViewQuery(queryArgs);

  const columns: Column = useMemo(
    () => [
      {
        id: "date",
        label: "Fecha",
        align: "left",
        minWidth: 160,
        render: (item: VInvoicesResponse) => formatDate(item.date),
      },
      {
        id: "client",
        label: "Cliente",
        align: "left",
        minWidth: 220,
        render: (item: VInvoicesResponse) => {
          const client = item.client as { name?: string } | string | null;
          if (typeof client === "string") return client;
          if (client && typeof client === "object" && client.name) {
            return client.name;
          }
          return "-";
        },
      },
      {
        id: "discount",
        label: "Descuento",
        minWidth: 140,
        disableSort: true,
        render: (item: VInvoicesResponse) => formatMoney(item.discount),
      },
      {
        id: "total",
        label: "Total",
        minWidth: 140,
        disableSort: true,
        render: (item: VInvoicesResponse) => formatMoney(item.total),
      },
    ],
    [],
  );

  const detailColumns: DetailColumn = useMemo(
    () => [
      {
        id: "invoice_products",
        title: "Productos",
        columns: [
          {
            id: "product",
            label: "Producto",
            align: "left",
            minWidth: 180,
            render: (item: any) => {
              if (item?.product_name) return item.product_name;
              const product = item?.product as { name?: string } | string | null;
              if (typeof product === "string") return product;
              if (product && typeof product === "object" && product.name) {
                return product.name;
              }
              return "-";
            },
          },
          {
            id: "amount",
            label: "Cantidad",
            minWidth: 120,
          },
          {
            id: "unit_price",
            label: "Precio Unit.",
            minWidth: 130,
            render: (item: any) => formatMoney(item?.unit_price),
          },
          {
            id: "discount",
            label: "Desc.",
            minWidth: 100,
            render: (item: any) => formatMoney(item?.discount),
          },
          {
            id: "total",
            label: "Total",
            minWidth: 120,
            render: (item: any) => formatMoney(item?.total),
          },
        ],
      },
    ],
    [],
  );

  return (
    <DataGrid
      data={data}
      error={error}
      isFetching={isFetching}
      columns={columns}
      detailColumns={detailColumns}
      hasCheckbox
      hasSearch
      searchPlaceholder="Buscar factura"
      initialQuery={queryArgs}
      onQueryChange={setQueryArgs}
    />
  );
}
