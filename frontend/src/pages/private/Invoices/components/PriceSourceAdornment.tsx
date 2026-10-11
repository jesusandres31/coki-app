import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { LastProductPriceForClient } from "src/app/services/invoiceService";
import {
  formatDate,
  formatMoney,
  normalizePbDateTime,
} from "src/utils/format";

type DisplayedPriceSource = "client" | "catalog" | "manual";

interface PriceSourceAdornmentProps {
  suggestion: LastProductPriceForClient;
  unitPrice: number | string;
  disabled?: boolean;
  onUsePrice: (unitPrice: number) => void;
}

const formatPbDate = (value: string) =>
  value ? formatDate(normalizePbDateTime(value)) : "-";

// The row price can be switched or typed by hand after the suggestion loads,
// so the source shown is derived from the current value.
const getDisplayedSource = (
  suggestion: LastProductPriceForClient,
  unitPrice: number | string
): DisplayedPriceSource => {
  const price = Number(unitPrice);
  if (unitPrice === "" || Number.isNaN(price)) return "manual";
  if (price === suggestion.unitPrice) return suggestion.source;
  if (price === suggestion.clientPrice) return "client";
  if (price === suggestion.catalogPrice) return "catalog";
  return "manual";
};

const sourceConfig = {
  client: {
    emoji: "🕘",
    title: "Último precio cobrado a este cliente",
  },
  catalog: {
    emoji: "✨",
    title: "Precio general actualizado",
  },
  manual: {
    emoji: "✏️",
    title: "Precio modificado a mano",
  },
} as const;

const PriceSourceAdornment = ({
  suggestion,
  unitPrice,
  disabled = false,
  onUsePrice,
}: PriceSourceAdornmentProps) => {
  const source = getDisplayedSource(suggestion, unitPrice);
  const { emoji, title } = sourceConfig[source];
  const pricesDiffer = suggestion.clientPrice !== suggestion.catalogPrice;

  // With a single candidate price there is nothing to choose, so only show
  // the indicator when the prices differ or the value was typed by hand.
  if (!pricesDiffer && source !== "manual") return null;
  const reason =
    suggestion.source === "catalog"
      ? "Se sugirió el precio general porque se actualizó después de la última venta a este cliente."
      : "Se sugirió el último precio cobrado porque el precio general no cambió desde esa venta.";

  const alternatives = [
    pricesDiffer &&
      source !== "client" && {
        label: "Usar último cobrado",
        price: suggestion.clientPrice,
      },
    source !== "catalog" && {
      label: "Usar precio general",
      price: suggestion.catalogPrice,
    },
  ].filter((option): option is { label: string; price: number } =>
    Boolean(option)
  );

  const tooltipContent = (
    <Stack spacing={0.75} sx={{ py: 0.5 }}>
      <Typography variant="subtitle2" component="span">
        {title}
      </Typography>
      <Box
        component="dl"
        sx={{
          m: 0,
          display: "grid",
          gridTemplateColumns: "auto auto",
          columnGap: 1.5,
          rowGap: 0.25,
          "& dt": { opacity: 0.8 },
          "& dd": {
            m: 0,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          },
        }}
      >
        <dt>Último cobrado ({formatPbDate(suggestion.clientPriceDate)})</dt>
        <dd>{formatMoney(suggestion.clientPrice)}</dd>
        <dt>
          Precio general
          {suggestion.catalogPriceUpdatedAt
            ? ` (act. ${formatPbDate(suggestion.catalogPriceUpdatedAt)})`
            : ""}
        </dt>
        <dd>{formatMoney(suggestion.catalogPrice)}</dd>
      </Box>
      {pricesDiffer && (
        <Typography variant="caption" component="span" sx={{ opacity: 0.85 }}>
          {reason}
        </Typography>
      )}
      {!disabled && alternatives.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {alternatives.map((option) => (
            <Button
              key={option.label}
              size="small"
              variant="text"
              onClick={() => onUsePrice(option.price)}
              sx={{
                textTransform: "none",
                color: "inherit",
                textDecoration: "underline",
                px: 0.5,
                py: 0,
                minHeight: 28,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  textDecoration: "underline",
                },
              }}
            >
              {option.label}: {formatMoney(option.price)}
            </Button>
          ))}
        </Stack>
      )}
    </Stack>
  );

  return (
    <InputAdornment position="end" sx={{ ml: 0.25 }}>
      <Tooltip
        title={tooltipContent}
        enterTouchDelay={0}
        leaveTouchDelay={8000}
        placement="top"
      >
        <IconButton
          size="small"
          edge="end"
          aria-label={`${title}. Ver detalle del precio`}
          sx={{ p: 0.25, fontSize: 16, lineHeight: 1 }}
        >
          {/* Emoji glyphs sit low in the line box; nudge up to match the digits. */}
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              display: "block",
              lineHeight: 1,
              transform: "translateY(-2px)",
            }}
          >
            {emoji}
          </Box>
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );
};

export default PriceSourceAdornment;
