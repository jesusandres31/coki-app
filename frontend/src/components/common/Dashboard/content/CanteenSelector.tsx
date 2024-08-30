import {
  Box,
  useTheme,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { LocationOnOutlined } from "@mui/icons-material";
import { canteenApi } from "src/app/services/canteenService";
import { useAuth, useUI } from "src/hooks";
import { userApi } from "src/app/services/userService";

export default function CanteenSelector() {
  const theme = useTheme();
  const { authUser, currentCanteen, setCurrentCanteen, setCurrentLocation } =
    useAuth();
  const { data: canteens } = canteenApi.useGetCanteensQuery();
  const [updateUser, { isLoading }] = userApi.useUpdateUserMutation();
  const { resetTableState } = useUI();

  const handleSelect = async (canteen: string, location: string) => {
    if (currentCanteen !== canteen) {
      try {
        setCurrentCanteen(canteen);
        setCurrentLocation(location);
        await updateUser({ id: authUser.id, data: { canteen } });
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
      {canteens && (
        <>
          <LocationOnOutlined sx={{ color: "white", mr: 1 }} />
          <TextField
            select
            size="small"
            sx={styles}
            value={currentCanteen || ""}
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
            {canteens.map((canteen) => (
              <MenuItem
                key={canteen.id}
                value={canteen.id}
                onClick={() => handleSelect(canteen.id, canteen.location)}
              >
                {canteen.name}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
    </Box>
  );
}
