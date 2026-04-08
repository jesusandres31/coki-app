import { AppRoutes } from ".";

// interfaces
interface Role {
  name: string;
}

interface RouteRoles {
  [key: string]: SystemRole[];
}

// this data match the database roles.
export enum SystemRole {
  ADMIN = "admin",
  REGULAR = "regular",
}

// route roles
export const routeRoles: RouteRoles = {
  [AppRoutes.Profile]: [SystemRole.ADMIN],
  [AppRoutes.Invoices]: [SystemRole.ADMIN, SystemRole.REGULAR],
};

// utils
export const getLandingPage = (roles: Role[]): AppRoutes => {
  if (roles.some((p) => p.name === SystemRole.ADMIN)) {
    return AppRoutes.Invoices;
  }
  if (roles.some((p) => p.name === SystemRole.REGULAR)) {
    return AppRoutes.Invoices;
  }
  return AppRoutes.Unauthorized;
};
