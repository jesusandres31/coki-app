const INVOICE_ID_TITLE_LENGTH = 5;

export const getShortInvoiceId = (invoiceId: string) =>
  invoiceId.slice(0, INVOICE_ID_TITLE_LENGTH);

export const buildInvoicePdfTitle = ({
  clientName,
  date,
  invoiceId,
}: {
  clientName: string;
  date: string;
  invoiceId: string;
}) => `${clientName} ${date} | Resumen de pedido "${getShortInvoiceId(invoiceId)}"`;

export const buildPriceListPdfTitle = (date: string) =>
  `Lista de precios ${date}`;

export const buildDeliveryListPdfTitle = (date: string) =>
  `Lista de reparto ${date}`;
