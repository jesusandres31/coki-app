import { AppRoutes } from "src/config";

/**
 * title
 */
export const translateTitle = (title?: string) => {
  switch (title) {
    case AppRoutes.Expenses:
      return "Egresos";
    case AppRoutes.ExpenseConcepts:
      return "Conceptos de Egresos";
    case AppRoutes.Clients:
      return "Clientes";
    case AppRoutes.Invoices:
      return "Ventas";
    case AppRoutes.Products:
      return "Productos";
    case AppRoutes.ProductsStores:
      return "Stock";
    case AppRoutes.StatsIncomes:
      return "Ventas";
    case AppRoutes.StatsClients:
      return "Clientes";
    case AppRoutes.StatsProducts:
      return "Productos";
    default:
      return title;
  }
};

export const removeForeslash = (str?: string) => {
  str = str || "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
