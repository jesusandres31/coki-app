import { Ball } from "src/interfaces";
import { Entity, IColumn } from "src/types";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { ballApi } from "src/app/services/ballService";
import { useUISelector } from "src/slices/ui/uiSlice";
import CreateOrUpdateBall from "./content/CreateOrUpdateBall";
import DeleteBalls from "./content/DeleteBalls";
import { formatDate } from "src/utils/format";

const COLUMNS: IColumn<Ball>[] = [
  {
    minWidth: 150,
    label: "Nombre",
    id: "name",
    align: "left",
  },
  {
    minWidth: 100,
    label: "Cancha",
    id: "field",
    render: (item) => item.expand.field.name,
  },
  {
    minWidth: 100,
    label: "Detalle",
    id: "detail",
  },
  {
    minWidth: 100,
    label: "Fecha Creación",
    id: "created",
    render: (item) => formatDate(item.created),
  },
];

const DEFAULT_ORDER_BY: keyof Ball = "created";

const ENTITY: Entity = "balls";

export default function Balls() {
  const { actionModal, selectedItems } = useUISelector((state) => state.ui);
  const [getBalls, { data, isFetching, error }] =
    ballApi.useLazyGetBallsQuery();

  const MODAL = {
    create: actionModal.create === ENTITY,
    update: actionModal.update === ENTITY,
    delete: actionModal.delete === ENTITY,
    label: selectedItems.length > 1 ? "Pelotas" : "Pelota",
  };

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={COLUMNS}
        defaultOrderBy={DEFAULT_ORDER_BY}
        fetchItemsFunc={getBalls}
        entity={ENTITY}
      />
      <DeleteBalls open={MODAL.delete} label={MODAL.label} />
      <CreateOrUpdateBall
        open={MODAL.create || MODAL.update}
        label={MODAL.label}
      />
    </>
  );
}
