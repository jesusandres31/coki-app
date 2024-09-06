import { ChangeEvent, useCallback } from "react";
import {
  Grid,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  lighten,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  debounce,
} from "@mui/material";
import {
  AddRounded,
  CreateRounded,
  DeleteForeverRounded,
  SearchRounded,
  ClearRounded,
} from "@mui/icons-material";
import { openModal, setFilter, useUISelector } from "src/slices/ui/uiSlice";
import { CustomButton, CustomButtonProps, CustomIconButton } from "./utils";
import { Entity, Order } from "src/types";
import { useAppDispatch } from "src/app/store";
import { useAuth, useUI } from "src/hooks";

interface CustomTableToolbarProps {
  handleFetchItems: (
    page: number,
    perPage: number,
    filter: string,
    order: Order,
    orderBy: string,
    currentStore?: string
  ) => Promise<void>;
  entity: Entity;
  bulkActionForOne?: CustomButtonProps[];
  bulkActionForMany?: CustomButtonProps[];
  disableCreateBtn?: boolean;
  disableDefaultOptBtn?: boolean;
}

export default function CustomTableToolbar({
  handleFetchItems,
  entity,
  bulkActionForOne,
  bulkActionForMany,
  disableCreateBtn = false,
  disableDefaultOptBtn = false,
}: CustomTableToolbarProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { currentStore } = useAuth();
  const { selectedItems, filter, order, orderBy, page, perPage } =
    useUISelector((state) => state.ui);
  const isManySelected = selectedItems.length > 0;
  const isOneSelected = selectedItems.length === 1;
  const { isMobile } = useUI();

  const debounceFetchItems = useCallback(
    debounce(async (filter: string) => {
      handleFetchItems(page, perPage, filter, order, orderBy, currentStore);
    }, 300),
    []
  );

  const handleSetFilter = async (filter: string) => {
    dispatch(setFilter(filter));
    debounceFetchItems(filter);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const filter = e.currentTarget.value;
    handleSetFilter(filter);
  };

  const handleClickClear = () => {
    if (filter) {
      handleSetFilter("");
    }
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        flex: "0 0 auto",
        py: 3,
        backgroundColor: isManySelected
          ? lighten(theme.palette.primary.light, 0.8)
          : theme.palette.background.paper,
      }}
    >
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ height: 55 }}
      >
        <Grid
          item
          sx={{
            display: "flex",
            alignItems: "center",
            width: isManySelected ? "50%" : "100%",
          }}
        >
          {isManySelected ? (
            <Typography
              variant={isMobile ? "subtitle2" : "subtitle1"}
              id="tableTitle"
              component="div"
              color="text.primary"
            >
              {`${selectedItems.length} items selected`}
            </Typography>
          ) : (
            <Grid
              container
              alignItems="center"
              sx={{ gap: 2, width: "100%" }}
              direction="row"
            >
              <Grid item sx={{ flex: 1, maxWidth: 450 }}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ my: -1, width: "100%" }}
                >
                  <InputLabel>Search</InputLabel>
                  <OutlinedInput
                    value={filter}
                    onChange={handleSearch}
                    startAdornment={
                      <InputAdornment
                        position="start"
                        sx={{ color: theme.palette.text.disabled }}
                      >
                        <SearchRounded />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={handleClickClear}>
                          <ClearRounded />
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Search"
                  />
                </FormControl>
              </Grid>
              <Grid item>
                {!disableCreateBtn && (
                  <CustomButton
                    text="Create"
                    icon={<AddRounded />}
                    onClick={() =>
                      dispatch(openModal({ entity, action: "create" }))
                    }
                  />
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
        <Grid item>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            {isOneSelected || isManySelected ? (
              <Grid item>
                <Grid container alignItems="center" sx={{ gap: 2 }}>
                  {isOneSelected && (
                    <>
                      {bulkActionForOne?.map((action) => (
                        <CustomIconButton
                          key={action.text}
                          {...action}
                          onClick={() => action.onClick()}
                        />
                      ))}
                      {!disableDefaultOptBtn && (
                        <CustomIconButton
                          text="Update"
                          icon={<CreateRounded />}
                          onClick={() =>
                            dispatch(openModal({ entity, action: "update" }))
                          }
                        />
                      )}
                    </>
                  )}
                  {isManySelected && (
                    <>
                      {bulkActionForMany?.map((action) => (
                        <CustomIconButton
                          key={action.text}
                          {...action}
                          onClick={() => action.onClick()}
                        />
                      ))}
                      {!disableDefaultOptBtn && (
                        <CustomIconButton
                          text="Remove"
                          icon={<DeleteForeverRounded />}
                          onClick={() =>
                            dispatch(openModal({ entity, action: "delete" }))
                          }
                        />
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
    </Toolbar>
  );
}
