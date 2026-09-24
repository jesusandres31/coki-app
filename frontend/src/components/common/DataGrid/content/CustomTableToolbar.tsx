import { ChangeEvent, ReactNode, useId } from "react";
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Button,
  Tooltip,
} from "@mui/material";
import { SearchRounded, ClearRounded, AddRounded } from "@mui/icons-material";
import { useUI } from "src/hooks";

interface CustomTableToolbarProps {
  filter: string;
  selectedCount: number;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  toolbarInfoElement?: ReactNode;
  toolbarElement?: ReactNode;
  createAction?: { label: string; onClick: () => void };
}

export default function CustomTableToolbar({
  filter,
  selectedCount,
  onSearch,
  searchPlaceholder = "Search",
  toolbarInfoElement,
  toolbarElement,
  createAction,
}: CustomTableToolbarProps) {
  const searchId = useId();
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
        flex: "0 0 auto",
        p: { xs: 1.5, sm: 2 },
        backgroundColor: hasSelection ? "action.selected" : "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: createAction ? "row" : "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
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
                maxWidth: toolbarInfoElement ? 680 : 450,
                minHeight: 40,
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              <FormControl
                variant="outlined"
                size="small"
                sx={{ width: "100%", maxWidth: 450 }}
              >
                <InputLabel htmlFor={searchId}>{searchPlaceholder}</InputLabel>
                <OutlinedInput
                  id={searchId}
                  value={filter}
                  onChange={handleSearch}
                  startAdornment={
                    <InputAdornment
                      position="start"
                      disablePointerEvents
                      sx={{ color: "text.disabled" }}
                    >
                      <SearchRounded />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Limpiar búsqueda"
                        edge="end"
                        onClick={handleClear}
                        size="small"
                        disabled={!filter}
                      >
                        <ClearRounded fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  }
                  label={searchPlaceholder}
                />
              </FormControl>
              {toolbarInfoElement ? (
                <Box
                  sx={{
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    alignSelf: { xs: "flex-end", sm: "center" },
                  }}
                >
                  {toolbarInfoElement}
                </Box>
              ) : null}
            </Box>
          )}
        </Box>

        {!hasSelection && createAction ? (
          <Box
            sx={{
              ml: { sm: "auto" },
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            {isMobile ? (
              <Tooltip title={createAction.label}>
                <IconButton
                  size="small"
                  color="primary"
                  aria-label={createAction.label}
                  onClick={createAction.onClick}
                  sx={{
                    width: 32,
                    height: 32,
                    color: "primary.contrastText",
                    bgcolor: "primary.main",
                    borderRadius: 1.25,
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <AddRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                size="small"
                variant="contained"
                startIcon={<AddRounded />}
                onClick={createAction.onClick}
              >
                {createAction.label}
              </Button>
            )}
          </Box>
        ) : null}

        {!hasSelection && toolbarElement ? (
          <Box
            sx={{
              display: "flex",
              width: { xs: "100%", sm: "auto" },
              marginLeft: { sm: "auto" },
              "& .MuiButton-root": { width: { xs: "100%", sm: "auto" } },
              justifyContent: "flex-end",
              alignItems: "center",
              pr: { xs: 0, sm: 1 },
            }}
          >
            {toolbarElement}
          </Box>
        ) : null}
      </Box>
    </Toolbar>
  );
}
