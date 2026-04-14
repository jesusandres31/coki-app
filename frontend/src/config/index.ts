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
  Reports = "/informes",
  Clients = "/clients",
  Products = "/products",
}

export const noLayoutRoutes = [AppRoutes.Profile];

// general config
export const configKey = {
  LANDING_PAGE: AppRoutes.Invoices,
  AUTHORIZATION: "Authorization",
  TOKEN_PREFIX: "Bearer",
};
