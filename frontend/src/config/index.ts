import packageJson from "../../package.json";

// envs
const SERVER_URL = import.meta.env.DEV
  ? import.meta.env.VITE_SERVER_URL_DEV
  : import.meta.env.VITE_SERVER_URL_PROD;

export const URL = {
  SERVER: `${SERVER_URL}`,
  API: `${SERVER_URL}/api`,
};

export const version = packageJson.version;

// application keys
export const key = {
  DRAWER: "drawer",
  STORE: "store",
};

// application routing
export enum AppRoutes {
  Wildcard = "*",
  Index = "/",
  Login = "/login",
  Unauthorized = "/unauthorized",
  // private routes
  Profile = "/profile",
  Expenses = "/expenses",
  ExpenseConcepts = "/expense-concepts",
  Clients = "/clients",
  Invoices = "/invoices",
  Products = "/products",
  ProductsStores = "/products-stores",
  StatsIncomes = "/stats/incomes",
  StatsClients = "/stats/clients",
  StatsProducts = "/stats/products",
}

export const noLayoutRoutes = [AppRoutes.Profile];

// general config
export const conf = {
  LANDING_PAGE: AppRoutes.Invoices,
  AUTHORIZATION: "Authorization",
  TOKEN_PREFIX: "Bearer",
};
