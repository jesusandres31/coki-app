import { Order } from "src/types";

// style
export const STYLE = {
  width: {
    textfield: 250,
  },
};

// pagination
export const PAGE = {
  firstPage: 1,
  rowsPerPage: 20,
};

// grid
export const NULL_VAL = "-";

export const getListArgsInitialState = {
  page: PAGE.firstPage,
  perPage: PAGE.rowsPerPage,
  filter: "",
  order: "desc" as Order,
  orderBy: "",
};
