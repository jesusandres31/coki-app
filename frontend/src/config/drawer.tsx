import {
  AssessmentRounded,
  DescriptionRounded,
  Inventory2Rounded,
  PeopleRounded,
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
        to: AppRoutes.Reports,
      },
    ],
  },
];
