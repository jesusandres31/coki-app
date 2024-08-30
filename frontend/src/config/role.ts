import { AppRoutes } from ".";

// interfaces
interface Role {
  name: string;
}

interface RouteRoles {
  [key: string]: SystemRole[];
}

// this data matchs the database roles.
export enum SystemRole {
  ADMIN = "admin",
  REGULAR = "regular",
}

// route roles
export const routeRoles: RouteRoles = {
  [AppRoutes.Profile]: [SystemRole.ADMIN],
  [AppRoutes.Expenses]: [SystemRole.ADMIN],
  [AppRoutes.ExpenseConcepts]: [SystemRole.ADMIN],
  [AppRoutes.Clients]: [SystemRole.ADMIN],
  [AppRoutes.Rentals]: [SystemRole.ADMIN],
  [AppRoutes.Invoices]: [SystemRole.ADMIN],
  [AppRoutes.Products]: [SystemRole.ADMIN],
  [AppRoutes.Fields]: [SystemRole.ADMIN],
  [AppRoutes.Balls]: [SystemRole.ADMIN],
  [AppRoutes.StatsIncomes]: [SystemRole.ADMIN],
  [AppRoutes.StatsClients]: [SystemRole.ADMIN],
  [AppRoutes.StatsProducts]: [SystemRole.ADMIN],
};

// utils
export const getLandingPage = (roles: Role[]): AppRoutes => {
  if (roles.some((p) => p.name === SystemRole.ADMIN)) {
    return AppRoutes.Rentals;
  }
  if (roles.some((p) => p.name === SystemRole.REGULAR)) {
    return AppRoutes.Rentals;
  }
  return AppRoutes.Unauthorized;
};
