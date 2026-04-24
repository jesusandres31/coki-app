import {
  AssessmentRounded,
  BarChartRounded,
  CategoryRounded,
  DescriptionRounded,
  Inventory2Rounded,
  LocalShippingRounded,
  PriceCheckRounded,
  PeopleRounded,
  SettingsRounded,
} from "@mui/icons-material";
import { AppRoutes } from "src/config";
import { DrawerSection } from "src/types";

export const DRAWER_SECTIONS: DrawerSection[] = [
  /* {
    // title: "Menu",
    menuItems: [],
  }, */
  {
    title: "Menu",
    menuItems: [
      {
        text: "Facturación",
        icon: <DescriptionRounded />,
        to: AppRoutes.Invoices,
      },
      {
        text: "Clientes",
        icon: <PeopleRounded />,
        to: AppRoutes.Clients,
      },
      {
        text: "Productos",
        icon: <Inventory2Rounded />,
        to: AppRoutes.Products,
      },
      {
        text: "Informes",
        icon: <AssessmentRounded />,
        nestedItems: [
          {
            text: "Lista de reparto",
            icon: <LocalShippingRounded />,
            to: AppRoutes.ReportsDistribution,
          },
          {
            text: "Ventas por período",
            icon: <BarChartRounded />,
            to: AppRoutes.ReportsSales,
          },
          {
            text: "Lista de precios",
            icon: <PriceCheckRounded />,
            to: AppRoutes.ReportsPriceList,
          },
        ],
      },
      {
        text: "Configuración",
        icon: <SettingsRounded />,
        nestedItems: [
          {
            text: "Tipos de producto",
            icon: <CategoryRounded />,
            to: AppRoutes.ConfigProductTypes,
          },
        ],
      },
    ],
  },
];
