import { useMediaQuery } from "@mui/material";
import { useAppDispatch } from "src/app/store";
import {
  resetCollapse,
  resetFilter,
  resetPage,
  resetSelectedItems,
  setOrderBy,
} from "src/slices/ui/uiSlice";

const DEFAULT_ORDER_BY = "created";

export const useUI = () => {
  const dispatch = useAppDispatch();

  const resetTableState = (orderBy?: string) => {
    dispatch(resetPage());
    dispatch(resetFilter());
    dispatch(resetSelectedItems());
    dispatch(resetCollapse());
    dispatch(setOrderBy(orderBy || DEFAULT_ORDER_BY));
  };

  const isMobile = useMediaQuery("(max-width:600px)");

  return { resetTableState, isMobile };
};
