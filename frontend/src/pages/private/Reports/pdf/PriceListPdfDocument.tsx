import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PriceListPdfModel } from "./model";

interface PriceListPdfDocumentProps {
  report: PriceListPdfModel;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
  },
  metaContainer: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 3,
    padding: 9,
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
    maxWidth: "74%",
    textAlign: "right",
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 3,
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
    paddingVertical: 6,
    paddingHorizontal: 7,
  },
  productCell: {
    width: "58%",
  },
  unitCell: {
    width: "16%",
    textAlign: "center",
  },
  priceCell: {
    width: "26%",
    textAlign: "right",
  },
  totalRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    fontWeight: 700,
  },
});

export function PriceListPdfDocument({ report }: PriceListPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Lista de precios</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Generado</Text>
            <Text style={styles.metaValue}>{report.generatedAt}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.productCell]}>Producto</Text>
            <Text style={[styles.cell, styles.unitCell]}>Unidad</Text>
            <Text style={[styles.cell, styles.priceCell]}>Precio</Text>
          </View>

          {report.items.map((item, index) => (
            <View
              key={item.id}
              style={
                index === report.items.length - 1
                  ? [styles.row, styles.lastRow]
                  : styles.row
              }
            >
              <Text style={[styles.cell, styles.productCell]}>{item.productName}</Text>
              <Text style={[styles.cell, styles.unitCell]}>{item.measureUnitName}</Text>
              <Text style={[styles.cell, styles.priceCell]}>{item.unitPrice}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text>Total de productos:</Text>
          <Text>{report.totalItems}</Text>
        </View>
      </Page>
    </Document>
  );
}
