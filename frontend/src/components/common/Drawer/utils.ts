import { AppRoutes } from "src/config";

/**
 * title
 */
export const translateTitle = (title?: string) => {
  const route = title || "";
  if (route.startsWith(AppRoutes.Invoices)) {
    return "Facturación";
  }
  if (route.startsWith(AppRoutes.Reports)) {
    return "Informes";
  }
  if (route.startsWith(AppRoutes.Clients)) {
    return "Clientes";
  }
  if (route.startsWith(AppRoutes.Products)) {
    return "Productos";
  }
  if (route.startsWith(AppRoutes.PriceList)) {
    return "Lista de precios";
  }

  switch (title) {
    case AppRoutes.Invoices:
      return "Facturación";
    case AppRoutes.Reports:
      return "Informes";
    case AppRoutes.Clients:
      return "Clientes";
    case AppRoutes.Products:
      return "Productos";
    case AppRoutes.PriceList:
      return "Lista de precios";
    default:
      return title;
  }
};

export const removeForeslash = (str?: string) => {
  str = str || "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
