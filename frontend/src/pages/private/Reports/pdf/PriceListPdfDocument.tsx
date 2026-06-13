import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildPriceListPdfTitle,
  PdfHeader,
  PdfSimpleTable,
  pdfStyles,
} from "src/components/common/pdf";
import { formatMoneyAmount } from "src/utils/format";
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
  moneyValue: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "baseline",
    width: "100%",
  },
  moneySymbol: {
    width: 7,
    marginRight: 4,
    textAlign: "center",
  },
  moneyAmount: {
    minWidth: 34,
    textAlign: "right",
  },
});

const renderPdfMoney = (value: number) => (
  <View style={styles.moneyValue}>
    <Text style={styles.moneySymbol}>$</Text>
    <Text style={styles.moneyAmount}>{formatMoneyAmount(value)}</Text>
  </View>
);

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
              render: (item) => renderPdfMoney(item.unitPrice),
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
