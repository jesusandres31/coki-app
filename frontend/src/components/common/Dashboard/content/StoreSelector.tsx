import {
  Box,
  useTheme,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { LocationOnOutlined } from "@mui/icons-material";
import { storeApi } from "src/app/services/storeService";
import { useAuth, useUI } from "src/hooks";
import { userApi } from "src/app/services/userService";

export default function StoreSelector() {
  const theme = useTheme();
  const { authUser, currentStore, setCurrentStore } = useAuth();
  const { data: stores } = storeApi.useGetStoresQuery();
  const [updateUser, { isLoading }] = userApi.useUpdateUserMutation();
  const { resetTableState } = useUI();

  const handleSelect = async (store: string) => {
    if (currentStore !== store) {
      try {
        setCurrentStore(store);
        await updateUser({ id: authUser.id, data: { store } });
        resetTableState();
      } catch (err) {
        throw err;
      }
    }
  };

  const styles = {
    "& .MuiInputBase-input": {
      fontSize: "1rem",
      color: "white",
      paddingBottom: 0,
    },
    "& .MuiInput-underline:before": {
      borderColor: `${theme.palette.primary.light} !important`,
    },
    "&:hover .MuiInput-underline:before": {
      borderColor: `${theme.palette.primary.light} !important`,
    },
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-end" }}>
      {stores && (
        <>
          <LocationOnOutlined sx={{ color: "white", mr: 1 }} />
          <TextField
            select
            size="small"
            sx={styles}
            value={currentStore || ""}
            variant="standard"
            defaultValue=""
            InputProps={{
              endAdornment: isLoading && (
                <InputAdornment position="start">
                  <CircularProgress color="primary" size={15} />
                </InputAdornment>
              ),
            }}
          >
            {stores.map((store) => (
              <MenuItem
                key={store.id}
                value={store.id}
                onClick={() => handleSelect(store.id)}
              >
                {store.name}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
    </Box>
  );
}
