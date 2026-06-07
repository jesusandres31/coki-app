import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildPriceListPdfTitle,
  PdfHeader,
  PdfSimpleTable,
  pdfStyles,
} from "src/components/common/pdf";
import { PriceListPdfItem, PriceListPdfModel } from "./model";
import { buildProductUnitPdfColumns } from "./reportPdfUtils";

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
});

export function PriceListPdfDocument({ report }: PriceListPdfDocumentProps) {
  return (
    <Document title={buildPriceListPdfTitle(report.generatedAt)}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          title="Lista de precios"
          aside={report.generatedAt}
        />

        <PdfSimpleTable
          rows={report.items}
          getRowKey={(item) => item.id}
          columns={[
            ...buildProductUnitPdfColumns<PriceListPdfItem>(
              styles.productCell,
              styles.unitCell,
            ),
            {
              key: "price",
              label: "Precio",
              style: styles.priceCell,
              render: (item) => item.unitPrice,
            },
          ]}
        />

        <View style={pdfStyles.reportTotalRow}>
          <Text>Total de productos:</Text>
          <Text>{report.totalItems}</Text>
        </View>
      </Page>
    </Document>
  );
}
