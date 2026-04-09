import { ChangeEvent, ReactNode } from "react";
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  alpha,
  useTheme,
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
  toolbarElement?: ReactNode;
}

export default function CustomTableToolbar({
  filter,
  selectedCount,
  onSearch,
  searchPlaceholder = "Search",
  toolbarElement,
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
          ? alpha(theme.palette.primary.main, 0.12)
          : "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
          {hasSelection ? (
            <Box
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
            </Box>
          ) : (
            <Box
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
                      sx={{ color: "text.disabled" }}
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
            </Box>
          )}
        </Box>

        {!hasSelection && toolbarElement ? (
          <Box
            sx={{
              display: "flex",
              marginLeft: "auto",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {toolbarElement}
          </Box>
        ) : null}
      </Box>
    </Toolbar>
  );
}
