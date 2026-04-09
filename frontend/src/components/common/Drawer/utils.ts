import { AppRoutes } from "src/config";

/**
 * title
 */
export const translateTitle = (title?: string) => {
  const route = title || "";
  if (route.startsWith(AppRoutes.Invoices)) {
    return "Facturación";
  }

  switch (title) {
    case AppRoutes.Invoices:
      return "Facturación";
    default:
      return title;
  }
};

export const removeForeslash = (str?: string) => {
  str = str || "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
