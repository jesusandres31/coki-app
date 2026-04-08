import { ChangeEvent } from "react";
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
} from "@mui/material";
import { SearchRounded, ClearRounded } from "@mui/icons-material";
import { useUI } from "src/hooks";

interface CustomTableToolbarProps {
  filter: string;
  selectedCount: number;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
}

export default function CustomTableToolbar({
  filter,
  selectedCount,
  onSearch,
  searchPlaceholder = "Search",
}: CustomTableToolbarProps) {
  const theme = useTheme();
  const { isMobile } = useUI();
  const hasSelection = selectedCount > 0;

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch(e.currentTarget.value);
  };

  const handleClear = () => {
    if (filter) onSearch("");
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        flex: "0 0 auto",
        py: { xs: 1, sm: 2 },
        backgroundColor: hasSelection
          ? lighten(theme.palette.primary.light, 0.8)
          : theme.palette.background.paper,
      }}
    >
      <Grid container justifyContent="space-between" alignItems="center">
        {hasSelection ? (
          <Grid
            sx={{
              height: 40,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant={isMobile ? "subtitle2" : "subtitle1"}
              id="tableTitle"
              component="div"
              color="text.primary"
            >
              {`${selectedCount} item${selectedCount === 1 ? "" : "s"} selected`}
            </Typography>
          </Grid>
        ) : (
          <Grid
            sx={{
              width: "100%",
              maxWidth: 450,
              height: 40,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FormControl variant="outlined" size="small" sx={{ width: "100%" }}>
              <InputLabel>{searchPlaceholder}</InputLabel>
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
                    <IconButton edge="end" onClick={handleClear}>
                      <ClearRounded />
                    </IconButton>
                  </InputAdornment>
                }
                label={searchPlaceholder}
              />
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Toolbar>
  );
}
