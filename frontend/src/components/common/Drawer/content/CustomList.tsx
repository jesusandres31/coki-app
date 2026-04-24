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
} from "@mui/material";
import { ExpandLessRounded, ExpandMoreRounded } from "@mui/icons-material";
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
  const backgroundColor = theme.palette.action.selected;
  const mutedItemColor = theme.palette.text.secondary;

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
          (nestedItem) => isSameOrChildRoute(nestedItem.to),
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
      sx={{ overflowX: "hidden" }}
      subheader={
        subheader ? (
          <ListSubheader
            sx={{
              height: 44,
              backgroundColor: "transparent",
              p: 0,
              lineHeight: "normal",
              userSelect: "none",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                pl: 1.5,
              }}
            >
              <Typography
                variant={"caption"}
                fontWeight={600}
                color="text.secondary"
                sx={{
                  textAlign: "center",
                  lineHeight: 1.2,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                {subheader}
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
                minHeight: 40,
                "&.Mui-selected": {
                  backgroundColor,
                },
                "&:hover": {
                  backgroundColor: selected
                    ? backgroundColor
                    : theme.palette.action.hover,
                },
                "&.Mui-selected:hover": {
                  backgroundColor,
                },
                backgroundColor: selected ? backgroundColor : "transparent",
                borderRadius: 1.25,
                transition: "background-color 0.2s ease",
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
                  minHeight: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: openDrawer ? "initial" : "center",
                  borderRadius: 1.5,
                }}
              >
                {item.icon && (
                  <Box display="flex">
                    <ListItemIcon
                      sx={{
                        color: selected ? "text.primary" : mutedItemColor,
                        minWidth: 0,
                        mr: openDrawer ? 2 : "auto",
                        justifyContent: "center",
                        "& .MuiSvgIcon-root": {
                          fontSize: isNested ? 18 : 22,
                        },
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
                        fontSize: isNested ? 12.5 : 13,
                        opacity: openDrawer ? 1 : 0,
                      }}
                      fontWeight={selected ? 600 : 500}
                      color={selected ? "text.primary" : mutedItemColor}
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
                    {openCollapse ? <ExpandLessRounded /> : <ExpandMoreRounded />}
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
