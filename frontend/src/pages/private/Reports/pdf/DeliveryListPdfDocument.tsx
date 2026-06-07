import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildDeliveryListPdfTitle,
  PdfHeader,
  PdfMeta,
  PdfSimpleTable,
  pdfStyles,
} from "src/components/common/pdf";
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
  const documentDate = report.selectedDaysText || report.generatedAt.split(" ")[0];

  return (
    <Document title={buildDeliveryListPdfTitle(documentDate)}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Lista de reparto" />

        <PdfMeta
          rows={[
            { label: "Días", value: report.selectedDaysText || "-" },
            { label: "Generado", value: report.generatedAt },
          ]}
        />

        <PdfSimpleTable
          rows={report.items}
          getRowKey={(item) => item.id}
          columns={[
            {
              key: "product",
              label: "Producto",
              style: styles.productCell,
              render: (item) => item.productName,
            },
            {
              key: "unit",
              label: "Unidad",
              style: styles.unitCell,
              render: (item) => item.measureUnitName,
            },
            {
              key: "amount",
              label: "Cantidad",
              style: styles.amountCell,
              render: (item) => item.amount,
            },
          ]}
        />

        <View style={styles.totalRow}>
          <Text>Total:</Text>
          <Text>{report.totalAmount}</Text>
        </View>
      </Page>
    </Document>
  );
}
