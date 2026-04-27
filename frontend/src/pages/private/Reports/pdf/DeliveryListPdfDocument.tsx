import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfHeader, PdfMeta, pdfStyles } from "src/components/common/pdf";
import { DeliveryListPdfModel } from "./model";

interface DeliveryListPdfDocumentProps {
  report: DeliveryListPdfModel;
}

const styles = StyleSheet.create({
  productCell: {
    width: "54%",
  },
  unitCell: {
    width: "21%",
    textAlign: "center",
  },
  amountCell: {
    width: "25%",
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

export function DeliveryListPdfDocument({ report }: DeliveryListPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Lista de reparto" />

        <PdfMeta
          rows={[
            { label: "Días", value: report.selectedDaysText || "-" },
            { label: "Generado", value: report.generatedAt },
          ]}
        />

        <View style={pdfStyles.table}>
          <View style={[pdfStyles.row, pdfStyles.headerRow]}>
            <Text style={[pdfStyles.cell, styles.productCell]}>Producto</Text>
            <Text style={[pdfStyles.cell, styles.unitCell]}>Unidad</Text>
            <Text style={[pdfStyles.cell, styles.amountCell]}>Cantidad</Text>
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
              <Text style={[pdfStyles.cell, styles.amountCell]}>{item.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text>Total:</Text>
          <Text>{report.totalAmount}</Text>
        </View>
      </Page>
    </Document>
  );
}
