import { DescriptionRounded } from "@mui/icons-material";
import { AppRoutes } from "src/config";
import { DrawerSection } from "src/types";

export const DRAWER_SECTIONS: DrawerSection[] = [
  /* {
    // title: "Menu",
    menuItems: [],
  }, */
  {
    menuItems: [
      {
        text: "Facturación",
        icon: <DescriptionRounded />,
        to: AppRoutes.Invoices,
      },
    ],
  },
];
