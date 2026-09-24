import { useMediaQuery, useTheme } from "@mui/material";
import { useAppDispatch } from "src/app/store";
import {
  resetCollapse,
  resetFilter,
  resetPage,
  resetSelectedItems,
  setOrderBy,
} from "src/slices/uiSlice";

const DEFAULT_ORDER_BY = "created";

export const useUI = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const resetTableState = (orderBy?: string) => {
    dispatch(resetPage());
    dispatch(resetFilter());
    dispatch(resetSelectedItems());
    dispatch(resetCollapse());
    dispatch(setOrderBy(orderBy || DEFAULT_ORDER_BY));
  };

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return { resetTableState, isMobile };
};
