import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildDeliveryListPdfTitle,
  PdfHeader,
  PdfMeta,
  PdfSimpleTable,
  pdfStyles,
} from "src/components/common/pdf";
import { DeliveryListPdfItem, DeliveryListPdfModel } from "./model";
import { buildProductUnitPdfColumns } from "./reportPdfUtils";

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
            ...buildProductUnitPdfColumns<DeliveryListPdfItem>(
              styles.productCell,
              styles.unitCell,
            ),
            {
              key: "amount",
              label: "Cantidad",
              style: styles.amountCell,
              render: (item) => item.amount,
            },
          ]}
        />

        <View style={pdfStyles.reportTotalRow}>
          <Text>Total:</Text>
          <Text>{report.totalAmount}</Text>
        </View>
      </Page>
    </Document>
  );
}
