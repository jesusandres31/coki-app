import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildInvoicePdfTitle,
  getShortInvoiceId,
  PdfHeader,
  PdfMeta,
  PdfSimpleTable,
  pdfStyles,
} from "src/components/common/pdf";
import { formatDecimal, formatMoneyAmount, formatPercent } from "src/utils/format";
import { InvoicePdfItem, InvoicePdfModel } from "./model";

interface InvoicePdfDocumentProps {
  invoice: InvoicePdfModel;
}

const formatInvoiceQuantity = (amount: number) =>
  Number.isInteger(amount) ? String(amount) : formatDecimal(amount, 3);

const renderPdfMoney = (value: number) => (
  <View style={styles.moneyValue}>
    <Text style={styles.moneySymbol}>$</Text>
    <Text style={styles.moneyAmount}>{formatMoneyAmount(value)}</Text>
  </View>
);

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 22,
    fontSize: 10,
  },
  header: {
    marginBottom: 7,
    gap: 8,
  },
  headerTitle: {
    fontSize: 13,
  },
  headerAside: {
    fontSize: 9,
    width: 160,
  },
  meta: {
    marginBottom: 9,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 2,
  },
  metaRow: {
    gap: 8,
  },
  tableCell: {
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    fontSize: 9.5,
  },
  tableHeaderCell: {
    paddingVertical: 4,
    fontSize: 9.5,
    fontWeight: 700,
  },
  tableRow: {
    minHeight: 15,
  },
  summary: {
    marginTop: 9,
    minWidth: 190,
    gap: 2,
    fontSize: 11,
  },
  grandTotal: {
    paddingTop: 4,
    marginTop: 1,
    fontSize: 13,
  },
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
  moneyValue: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "baseline",
    alignSelf: "flex-end",
  },
  moneySymbol: {
    width: 7,
    marginRight: 4,
    textAlign: "center",
  },
  moneyAmount: {
    minWidth: 52,
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
      <Page size="A4" style={[pdfStyles.page, styles.page]}>
        <PdfHeader
          title="Resumen de pedido"
          aside={`ID: ${shortInvoiceId}\nDocumento no válido como factura`}
          style={styles.header}
          titleStyle={styles.headerTitle}
          asideStyle={styles.headerAside}
        />

        <PdfMeta
          style={styles.meta}
          rowStyle={styles.metaRow}
          rows={[
            { label: "Cliente", value: invoice.clientName },
            { label: "Fecha", value: invoice.date },
          ]}
        />

        <PdfSimpleTable
          rows={invoice.items}
          getRowKey={(item) => item.id}
          rowStyle={styles.tableRow}
          cellStyle={styles.tableCell}
          headerCellStyle={styles.tableHeaderCell}
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
              render: (item) => formatInvoiceQuantity(item.amount),
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
              render: (item) => renderPdfMoney(item.unitPrice),
            },
            ...discountColumns,
            {
              key: "total",
              label: "Total",
              style: styles.totalCell,
              render: (item) => renderPdfMoney(item.total),
            },
          ]}
        />

        <View style={[pdfStyles.summary, styles.summary]}>
          {hasInvoiceDiscount ? (
            <View style={pdfStyles.summaryRow}>
              <Text>Subtotal</Text>
              {renderPdfMoney(invoice.subtotal)}
            </View>
          ) : null}
          {hasInvoiceDiscount ? (
            <View style={pdfStyles.summaryRow}>
              <Text>Descuento factura</Text>
              <Text>{formatPercent(invoice.discountPercent)}</Text>
            </View>
          ) : null}
          <View
            style={[
              pdfStyles.summaryRow,
              pdfStyles.grandTotal,
              styles.grandTotal,
            ]}
          >
            <Text>Total</Text>
            {renderPdfMoney(invoice.total)}
          </View>
        </View>
      </Page>
    </Document>
  );
}
