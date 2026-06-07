import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildInvoicePdfTitle,
  getShortInvoiceId,
  PdfHeader,
  PdfMeta,
  PdfSimpleTable,
  pdfStyles,
} from "src/components/common/pdf";
import { formatMoney, formatPercent } from "src/utils/format";
import { InvoicePdfItem, InvoicePdfModel } from "./model";

interface InvoicePdfDocumentProps {
  invoice: InvoicePdfModel;
}

const styles = StyleSheet.create({
  productCell: {
    width: "31%",
  },
  productCellWithoutDiscount: {
    width: "40%",
  },
  qtyCell: {
    width: "10%",
    textAlign: "right",
  },
  unitCell: {
    width: "11%",
    textAlign: "center",
  },
  unitCellWithoutDiscount: {
    width: "13%",
    textAlign: "center",
  },
  unitPriceCell: {
    width: "16%",
    textAlign: "right",
  },
  unitPriceCellWithoutDiscount: {
    width: "17%",
    textAlign: "right",
  },
  discountCell: {
    width: "12%",
    textAlign: "right",
  },
  totalCell: {
    width: "20%",
    textAlign: "right",
  },
});

export function InvoicePdfDocument({ invoice }: InvoicePdfDocumentProps) {
  const hasInvoiceDiscount = invoice.discountPercent > 0;
  const hasItemDiscounts = invoice.items.some((item) => item.discount > 0);
  const productCellStyle = hasItemDiscounts
    ? styles.productCell
    : styles.productCellWithoutDiscount;
  const unitCellStyle = hasItemDiscounts
    ? styles.unitCell
    : styles.unitCellWithoutDiscount;
  const unitPriceCellStyle = hasItemDiscounts
    ? styles.unitPriceCell
    : styles.unitPriceCellWithoutDiscount;
  const shortInvoiceId = getShortInvoiceId(invoice.invoiceId);
  const discountColumns = hasItemDiscounts
    ? [
        {
          key: "discount",
          label: "Desc. %",
          style: styles.discountCell,
          render: (item: InvoicePdfItem) => formatPercent(item.discount),
        },
      ]
    : [];
  const documentTitle = buildInvoicePdfTitle({
    clientName: invoice.clientName,
    date: invoice.date,
    invoiceId: invoice.invoiceId,
  });

  return (
    <Document title={documentTitle}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          title="Resumen de pedido"
          aside={`ID: ${shortInvoiceId}\nDocumento no válido como factura`}
        />

        <PdfMeta
          rows={[
            { label: "Cliente", value: invoice.clientName },
            { label: "Fecha", value: invoice.date },
          ]}
        />

        <PdfSimpleTable
          rows={invoice.items}
          getRowKey={(item) => item.id}
          columns={[
            {
              key: "product",
              label: "Producto",
              style: productCellStyle,
              render: (item) => item.productName,
            },
            {
              key: "amount",
              label: "Cant.",
              style: styles.qtyCell,
              render: (item) => item.amount,
            },
            {
              key: "unit",
              label: "Unidad",
              style: unitCellStyle,
              render: (item) => item.measureUnitName,
            },
            {
              key: "unitPrice",
              label: "Precio Unit.",
              style: unitPriceCellStyle,
              render: (item) => formatMoney(item.unitPrice),
            },
            ...discountColumns,
            {
              key: "total",
              label: "Total",
              style: styles.totalCell,
              render: (item) => formatMoney(item.total),
            },
          ]}
        />

        <View style={pdfStyles.summary}>
          {hasInvoiceDiscount ? (
            <View style={pdfStyles.summaryRow}>
              <Text>Subtotal</Text>
              <Text>{formatMoney(invoice.subtotal)}</Text>
            </View>
          ) : null}
          {hasInvoiceDiscount ? (
            <View style={pdfStyles.summaryRow}>
              <Text>Descuento factura</Text>
              <Text>{formatPercent(invoice.discountPercent)}</Text>
            </View>
          ) : null}
          <View style={[pdfStyles.summaryRow, pdfStyles.grandTotal]}>
            <Text>Total</Text>
            <Text>{formatMoney(invoice.total)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
