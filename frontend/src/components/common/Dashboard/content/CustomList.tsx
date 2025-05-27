import React, { useEffect, useState } from "react";
import {
  Typography,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ListItem,
  List,
  Box,
  useTheme,
  ListSubheader,
  Collapse,
  lighten,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useRouter } from "src/hooks";
import { IMenuItem } from "src/types";
import { removeForeslash, translateTitle } from "src/utils/header";
import { toggleOpenDrawer, useUISelector } from "src/slices/ui/uiSlice";
import { useAppDispatch } from "src/app/store";

interface CustomListProps {
  items: IMenuItem[];
  subheader?: string;
  isNested?: boolean;
}

export default function CustomList({
  items,
  subheader,
  isNested,
}: CustomListProps) {
  const { handleGoTo, route } = useRouter();
  const dispatch = useAppDispatch();
  const { openDrawer } = useUISelector((state) => state.ui);
  const theme = useTheme();
  const backgroundColor = lighten(theme.palette.primary.light, 0.9);
  // const borderRadius = 8;

  const isSelected = (item: IMenuItem) => {
    if (item.to) {
      return item.to === route;
    }
    if (!openDrawer) {
      return item.nestedItems?.some((nestedItem) => nestedItem.to === route);
    }
  };

  // --- FIX: Manage openCollapse state for all items at the top level ---
  const [openCollapses, setOpenCollapses] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (!openDrawer) {
      // Close all collapses if drawer is closed
      setOpenCollapses({});
      return;
    }
    // Initialize openCollapses for items with nestedItems if their nested item matches route
    const newOpenCollapses: { [key: string]: boolean } = {};
    items.forEach((item, index) => {
      if (item.nestedItems) {
        const hasNestedSelected = item.nestedItems.some(
          (nestedItem) => route === nestedItem.to
        );
        newOpenCollapses[item.to || `index-${index}`] = hasNestedSelected;
      }
    });
    setOpenCollapses((prev) => ({ ...prev, ...newOpenCollapses }));
  }, [route, items, openDrawer]);

  const handleCollapse = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    itemKey: string
  ) => {
    setOpenCollapses((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
    if (!openDrawer) toggleOpenDrawer();
    e.stopPropagation();
  };

  const isNestedSelected = (item: IMenuItem) => {
    return item.nestedItems?.some((nestedItem) => nestedItem.to === route);
  };

  return (
    <List
      component="div"
      subheader={
        subheader && openDrawer ? (
          <ListSubheader>
            <Box py={1.5}>
              <Typography
                variant="subtitle2"
                sx={{ opacity: openDrawer ? 1 : 0 }}
              >
                {openDrawer ? subheader : ""}
              </Typography>
            </Box>
          </ListSubheader>
        ) : null
      }
    >
      {items.map((item, index) => {
        const itemKey = item.to || `index-${index}`;
        const openCollapse = openCollapses[itemKey] || false;

        return (
          <React.Fragment key={`${index}-${item.to}`}>
            <ListItem
              disablePadding
              sx={{
                pl: isNested ? 1.5 : 0,
                height: "45px",
                "&.Mui-selected": {
                  backgroundColor,
                  // borderRadius,
                },
                "&:hover": {
                  backgroundColor: item.to ? backgroundColor : "transparent",
                  // borderRadius,
                },
                "&.Mui-selected:hover": {
                  backgroundColor,
                  // borderRadius,
                },
                display: "block",
              }}
            >
              <ListItemButton
                selected={isSelected(item) || isNestedSelected(item)}
                onClick={(e) => {
                  if (item.to) {
                    handleGoTo(item.to);
                  } else {
                    handleCollapse(e, itemKey);
                  }
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                  minHeight: 48,
                  justifyContent: openDrawer ? "initial" : "center",
                  /* px: 2.5, */
                }}
              >
                {item.icon && (
                  <Box display="flex">
                    <ListItemIcon
                      sx={{
                        /* minWidth: "40px", */
                        color: "secondary.light",
                        minWidth: 0,
                        mr: openDrawer ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </Box>
                )}
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: isNested ? 12 : 13,
                        opacity: openDrawer ? 1 : 0,
                      }}
                      fontWeight={isSelected(item) ? "bold" : ""}
                      color={
                        isSelected(item)
                          ? theme.palette.primary.main
                          : "text.primary"
                      }
                    >
                      {item.text || translateTitle(removeForeslash(item.to))}
                    </Typography>
                  }
                />
                {item.nestedItems && (
                  <div
                    style={{
                      /* display: "flex", */
                      alignItems: "center",
                      color: theme.palette.text.disabled,
                      padding: 5,
                      display: openDrawer ? "flex" : "none",
                    }}
                    onClick={(e) => handleCollapse(e, itemKey)}
                  >
                    {openCollapse ? <ExpandLess /> : <ExpandMore />}
                  </div>
                )}
              </ListItemButton>
            </ListItem>
            {item.nestedItems && (
              <Collapse in={openCollapse} timeout="auto" unmountOnExit>
                <CustomList items={item.nestedItems} isNested={true} />
              </Collapse>
            )}
          </React.Fragment>
        );
      })}
    </List>
  );
}
