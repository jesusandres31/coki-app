import {
  DeleteRounded,
  EditRounded,
  OpenInNewRounded,
} from "@mui/icons-material";
import { DataGridRowAction } from "src/types";

interface BuildCrudRowActionsArgs<T> {
  entityLabel: string;
  baseRoute: string;
  handleGoTo: (path: string) => void;
  onDelete: (item: T) => void;
}

export const buildCrudRowActions = <T,>({
  entityLabel,
  baseRoute,
  handleGoTo,
  onDelete,
}: BuildCrudRowActionsArgs<T>): DataGridRowAction[] => [
  {
    id: "open",
    label: `Abrir ${entityLabel}`,
    icon: <OpenInNewRounded fontSize="small" color="primary" />,
    onClick: (item) => handleGoTo(`${baseRoute}/${item.id}`),
  },
  {
    id: "edit",
    label: `Editar ${entityLabel}`,
    icon: <EditRounded fontSize="small" color="info" />,
    onClick: (item) => handleGoTo(`${baseRoute}/${item.id}?mode=edit`),
  },
  {
    id: "delete",
    label: `Eliminar ${entityLabel}`,
    icon: <DeleteRounded fontSize="small" color="error" />,
    onClick: (item) => onDelete(item as T),
  },
];
