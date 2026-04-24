import packageJson from "../../package.json";

// envs
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const config = {
  PB: {
    SERVER: `${SERVER_URL}`,
    API: `${SERVER_URL}/api`,
  },
  API: {
    URL: import.meta.env.VITE_API_URL,
    SECURITY_TOKEN: import.meta.env.VITE_API_SECURITY_TOKEN,
  },
};

export const version = packageJson.version;

// application keys
export const storageKey = {
  DRAWER: "drawer",
};

// application routing
export enum AppRoutes {
  Wildcard = "*",
  Index = "/",
  Login = "/login",
  Unauthorized = "/unauthorized",
  // private routes
  Profile = "/profile",
  Invoices = "/invoices",
  InvoicesNew = "/invoices/new",
  InvoicesDetail = "/invoices/:invoiceId",
  Reports = "/reports",
  ReportsDistribution = "/reports/distribution",
  ReportsSales = "/reports/sales",
  Clients = "/clients",
  ClientsNew = "/clients/new",
  ClientsDetail = "/clients/:clientId",
  Products = "/products",
  ProductsNew = "/products/new",
  ProductsDetail = "/products/:productId",
  Config = "/config",
  ConfigProductTypes = "/config/product-types",
  ConfigProductTypesNew = "/config/product-types/new",
  ConfigProductTypesDetail = "/config/product-types/:productTypeId",
}

export const noLayoutRoutes = [AppRoutes.Profile];

// general config
export const configKey = {
  LANDING_PAGE: AppRoutes.Invoices,
  AUTHORIZATION: "Authorization",
  TOKEN_PREFIX: "Bearer",
};
