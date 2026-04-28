import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildPriceListPdfTitle,
  PdfHeader,
  pdfStyles,
} from "src/components/common/pdf";
import { PriceListPdfModel } from "./model";

interface PriceListPdfDocumentProps {
  report: PriceListPdfModel;
}

const styles = StyleSheet.create({
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
    <Document title={buildPriceListPdfTitle(report.generatedAt)}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          title="Lista de precios"
          aside={report.generatedAt}
        />

        <View style={pdfStyles.table}>
          <View style={[pdfStyles.row, pdfStyles.headerRow]}>
            <Text style={[pdfStyles.cell, styles.productCell]}>Producto</Text>
            <Text style={[pdfStyles.cell, styles.unitCell]}>Unidad</Text>
            <Text style={[pdfStyles.cell, styles.priceCell]}>Precio</Text>
          </View>

          {report.items.map((item, index) => (
            <View
              key={item.id}
              style={
                index === report.items.length - 1
                  ? [pdfStyles.row, pdfStyles.lastRow]
                  : pdfStyles.row
              }
            >
              <Text style={[pdfStyles.cell, styles.productCell]}>{item.productName}</Text>
              <Text style={[pdfStyles.cell, styles.unitCell]}>{item.measureUnitName}</Text>
              <Text style={[pdfStyles.cell, styles.priceCell]}>{item.unitPrice}</Text>
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
