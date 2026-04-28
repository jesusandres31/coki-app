import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildInvoicePdfTitle,
  getShortInvoiceId,
  PdfHeader,
  PdfMeta,
  pdfStyles,
} from "src/components/common/pdf";
import { formatMoney, formatPercent } from "src/utils/format";
import { InvoicePdfModel } from "./model";

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

        <View style={pdfStyles.table}>
          <View style={[pdfStyles.row, pdfStyles.headerRow]}>
            <Text style={[pdfStyles.cell, productCellStyle]}>Producto</Text>
            <Text style={[pdfStyles.cell, styles.qtyCell]}>Cant.</Text>
            <Text style={[pdfStyles.cell, unitCellStyle]}>Unidad</Text>
            <Text style={[pdfStyles.cell, unitPriceCellStyle]}>
              Precio Unit.
            </Text>
            {hasItemDiscounts ? (
              <Text style={[pdfStyles.cell, styles.discountCell]}>Desc. %</Text>
            ) : null}
            <Text style={[pdfStyles.cell, styles.totalCell]}>Total</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View
              key={item.id}
              style={
                index === invoice.items.length - 1
                  ? [pdfStyles.row, pdfStyles.lastRow]
                  : pdfStyles.row
              }
            >
              <Text style={[pdfStyles.cell, productCellStyle]}>
                {item.productName}
              </Text>
              <Text style={[pdfStyles.cell, styles.qtyCell]}>
                {item.amount}
              </Text>
              <Text style={[pdfStyles.cell, unitCellStyle]}>
                {item.measureUnitName}
              </Text>
              <Text style={[pdfStyles.cell, unitPriceCellStyle]}>
                {formatMoney(item.unitPrice)}
              </Text>
              {hasItemDiscounts ? (
                <Text style={[pdfStyles.cell, styles.discountCell]}>
                  {formatPercent(item.discount)}
                </Text>
              ) : null}
              <Text style={[pdfStyles.cell, styles.totalCell]}>
                {formatMoney(item.total)}
              </Text>
            </View>
          ))}
        </View>

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
