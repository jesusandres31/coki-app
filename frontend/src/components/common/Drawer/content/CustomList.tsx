import React, { useEffect, useRef, useState } from "react";
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
  alpha,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useRouter } from "src/hooks";
import { IMenuItem } from "src/types";
import { toggleOpenDrawer, useUISelector } from "src/slices/uiSlice";
import { removeForeslash, translateTitle } from "../utils";
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
  const { openDrawer } = useUISelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const backgroundColor = alpha(theme.palette.secondary.main, 0.08);

  const isSameOrChildRoute = (baseRoute?: string) => {
    if (!baseRoute) return false;
    return route === baseRoute || route.startsWith(`${baseRoute}/`);
  };

  const isSelected = (item: IMenuItem) => {
    if (item.to) {
      return isSameOrChildRoute(item.to);
    }
    if (!openDrawer) {
      return item.nestedItems?.some((nestedItem) =>
        isSameOrChildRoute(nestedItem.to),
      );
    }
  };

  // --- FIX: Manage openCollapse state for all items at the top level ---
  const [openCollapses, setOpenCollapses] = useState<{
    [key: string]: boolean;
  }>({});

  // Ref to track which item should be opened when drawer opens
  const pendingOpenRef = useRef<string | null>(null);

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
          (nestedItem) => route === nestedItem.to,
        );
        newOpenCollapses[item.to || `index-${index}`] = hasNestedSelected;
      }
    });

    // If there's a pending item to open (clicked while drawer was closed), force it open
    if (pendingOpenRef.current) {
      newOpenCollapses[pendingOpenRef.current] = true;
      pendingOpenRef.current = null;
    }

    setOpenCollapses((prev) => ({ ...prev, ...newOpenCollapses }));
  }, [route, items, openDrawer]);

  const handleCollapse = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    itemKey: string,
  ) => {
    if (!openDrawer) {
      // Store the item to open after drawer opens
      pendingOpenRef.current = itemKey;
      dispatch(toggleOpenDrawer());
    } else {
      // Toggle normally when drawer is already open
      setOpenCollapses((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
    }
    e.stopPropagation();
  };

  const isNestedSelected = (item: IMenuItem) => {
    return item.nestedItems?.some((nestedItem) =>
      isSameOrChildRoute(nestedItem.to),
    );
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
        const selected = isSelected(item) || isNestedSelected(item);

        return (
          <React.Fragment key={`${index}-${item.to}`}>
            <ListItem
              disablePadding
              sx={{
                marginBottom: 0.35,
                pl: isNested ? 1.5 : 0,
                minHeight: 44,
                "&.Mui-selected": {
                  backgroundColor,
                },
                "&:hover": {
                  backgroundColor: item.to ? backgroundColor : "transparent",
                },
                "&.Mui-selected:hover": {
                  backgroundColor,
                },
                backgroundColor: selected ? backgroundColor : "transparent",
                border: "1px solid",
                borderColor: selected ? "secondary.dark" : "transparent",
                borderRadius: 1.5,
                transition: "background-color 0.2s ease, border-color 0.2s ease",
                display: "block",
              }}
            >
              <ListItemButton
                // selected={isSelected(item) || isNestedSelected(item)}
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
                  minHeight: 44,
                  justifyContent: openDrawer ? "initial" : "center",
                  borderRadius: 1.5,
                }}
              >
                {item.icon && (
                  <Box display="flex">
                    <ListItemIcon
                      sx={{
                        color: selected ? "secondary.dark" : "text.secondary",
                        minWidth: 0,
                        mr: openDrawer ? 2 : "auto",
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
                        fontSize: isNested ? 12 : 13.5,
                        opacity: openDrawer ? 1 : 0,
                      }}
                      fontWeight={selected ? 700 : 600}
                      color={selected ? "secondary.dark" : "text.secondary"}
                    >
                      {item.text || translateTitle(removeForeslash(item.to))}
                    </Typography>
                  }
                />
                {item.nestedItems && (
                  <div
                    style={{
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
