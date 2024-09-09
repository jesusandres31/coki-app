import {
  StorefrontRounded,
  ShoppingCartRounded,
  PeopleRounded,
  DataSaverOffRounded,
  ConstructionRounded,
  CurrencyExchangeRounded,
} from "@mui/icons-material";
import { AppRoutes } from "src/config";
import { DrawerSection } from "src/types";

export const DRAWER_SECTIONS: DrawerSection[] = [
  {
    // title: "Menu",
    menuItems: [
      {
        icon: <StorefrontRounded />,
        to: AppRoutes.Invoices,
      },
      {
        icon: <CurrencyExchangeRounded />,
        to: AppRoutes.Expenses,
      },
      {
        icon: <ShoppingCartRounded />,
        to: AppRoutes.ProductsStores,
      },
      {
        icon: <PeopleRounded />,
        to: AppRoutes.Clients,
      },
    ],
  },
  {
    // title: "Config",
    menuItems: [
      {
        text: "Administrar",
        icon: <ConstructionRounded />,
        nestedItems: [
          {
            to: AppRoutes.ExpenseConcepts,
          },
          {
            to: AppRoutes.Products,
          },
        ],
      },
    ],
  },
  {
    // title: "Reportes",
    menuItems: [
      {
        text: "Estadisticas",
        icon: <DataSaverOffRounded />,
        nestedItems: [
          {
            to: AppRoutes.StatsIncomes,
          },
          {
            to: AppRoutes.StatsProducts,
          },
          {
            to: AppRoutes.StatsClients,
          },
        ],
      },
    ],
  },
];
