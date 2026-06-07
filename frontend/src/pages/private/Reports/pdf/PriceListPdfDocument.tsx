import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildPriceListPdfTitle,
  PdfHeader,
  PdfSimpleTable,
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
              key: "price",
              label: "Precio",
              style: styles.priceCell,
              render: (item) => item.unitPrice,
            },
          ]}
        />

        <View style={styles.totalRow}>
          <Text>Total de productos:</Text>
          <Text>{report.totalItems}</Text>
        </View>
      </Page>
    </Document>
  );
}
