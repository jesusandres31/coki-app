import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatMoney, formatPercent } from "src/utils/format";
import { InvoicePdfModel } from "./model";

interface InvoicePdfDocumentProps {
  invoice: InvoicePdfModel;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 12,
  },
  metaContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 10,
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    color: "#6B7280",
  },
  metaValue: {
    fontWeight: 600,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#F3F4F6",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  productCell: {
    width: "31%",
  },
  qtyCell: {
    width: "10%",
    textAlign: "right",
  },
  unitCell: {
    width: "11%",
    textAlign: "center",
  },
  unitPriceCell: {
    width: "16%",
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
  totals: {
    marginTop: 16,
    alignSelf: "flex-end",
    minWidth: 220,
    gap: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    paddingTop: 6,
    marginTop: 2,
    fontWeight: 700,
    fontSize: 10,
  },
});

export function InvoicePdfDocument({ invoice }: InvoicePdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Factura #{invoice.invoiceId}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Cliente</Text>
            <Text style={styles.metaValue}>{invoice.clientName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Fecha</Text>
            <Text style={styles.metaValue}>{invoice.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Estado</Text>
            <Text style={styles.metaValue}>{invoice.stateLabel}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.productCell]}>Producto</Text>
            <Text style={[styles.cell, styles.qtyCell]}>Cant.</Text>
            <Text style={[styles.cell, styles.unitCell]}>Unidad</Text>
            <Text style={[styles.cell, styles.unitPriceCell]}>
              Precio Unit.
            </Text>
            <Text style={[styles.cell, styles.discountCell]}>Desc. %</Text>
            <Text style={[styles.cell, styles.totalCell]}>Total</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View
              key={item.id}
              style={
                index === invoice.items.length - 1
                  ? [styles.row, styles.lastRow]
                  : styles.row
              }
            >
              <Text style={[styles.cell, styles.productCell]}>
                {item.productName}
              </Text>
              <Text style={[styles.cell, styles.qtyCell]}>{item.amount}</Text>
              <Text style={[styles.cell, styles.unitCell]}>
                {item.measureUnitName}
              </Text>
              <Text style={[styles.cell, styles.unitPriceCell]}>
                {formatMoney(item.unitPrice)}
              </Text>
              <Text style={[styles.cell, styles.discountCell]}>
                {formatPercent(item.discount)}
              </Text>
              <Text style={[styles.cell, styles.totalCell]}>
                {formatMoney(item.total)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatMoney(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Descuento factura</Text>
            <Text>{formatPercent(invoice.discountPercent)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>{formatMoney(invoice.total)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
