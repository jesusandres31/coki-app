import { useEffect, useMemo, useState } from "react";
import { OpenInNewRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import { useGetClientsListQuery } from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { ClientsResponse } from "src/types/pocketbase-types";
import { Column, DataGridRowAction, GetList } from "src/types";
import { clientsBreadcrumbFlow } from "./breadcrumbFlow";

export default function Clients() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));

  useEffect(() => {
    dispatch(setBreadcrumbs(clientsBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } = useGetClientsListQuery(queryArgs);

  const columns: Column = useMemo(
    () => [
      {
        id: "name",
        label: "Nombre",
        align: "left",
        minWidth: 220,
      },
      {
        id: "address",
        label: "Dirección",
        align: "left",
        minWidth: 260,
      },
      {
        id: "phone",
        label: "Teléfono",
        align: "left",
        minWidth: 180,
      },
    ],
    [],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () => [
      {
        id: "open",
        label: "Abrir cliente",
        icon: <OpenInNewRounded fontSize="small" color="primary" />,
        onClick: (item) => handleGoTo(`${AppRoutes.Clients}/${item.id}`),
      },
    ],
    [handleGoTo],
  );

  return (
    <DataGrid
      data={data}
      error={error}
      isFetching={isFetching}
      columns={columns}
      hasSearch
      searchPlaceholder="Buscar cliente"
      initialQuery={queryArgs}
      onQueryChange={setQueryArgs}
      rowActions={rowActions}
      toolbarElement={
        <Button
          size="small"
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => handleGoTo(AppRoutes.ClientsNew)}
        >
          Crear cliente
        </Button>
      }
    />
  );
}
