import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { ReactNode } from "react";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
  },
  headerAside: {
    width: 180,
    color: "#6B7280",
    fontSize: 8,
    textAlign: "right",
  },
  metaContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 3,
    padding: 10,
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
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
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  summary: {
    marginTop: 16,
    alignSelf: "flex-end",
    minWidth: 220,
    gap: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    paddingTop: 6,
    marginTop: 2,
    fontWeight: 700,
    fontSize: 12,
  },
  reportTotalRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    fontWeight: 700,
  },
});

interface PdfHeaderProps {
  title: string;
  aside?: string;
}

export function PdfHeader({ title, aside }: PdfHeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.headerTitle}>{title}</Text>
      {aside ? <Text style={pdfStyles.headerAside}>{aside}</Text> : null}
    </View>
  );
}

interface PdfMetaProps {
  rows: {
    label: string;
    value: ReactNode;
  }[];
}

export function PdfMeta({ rows }: PdfMetaProps) {
  return (
    <View style={pdfStyles.metaContainer}>
      {rows.map((row) => (
        <View key={row.label} style={pdfStyles.metaRow}>
          <Text style={pdfStyles.metaLabel}>{row.label}</Text>
          <Text style={pdfStyles.metaValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

export interface PdfSimpleTableColumn<T> {
  key: string;
  label: string;
  style: any;
  render: (row: T) => ReactNode;
}

interface PdfSimpleTableProps<T> {
  columns: PdfSimpleTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
}

export function PdfSimpleTable<T>({
  columns,
  rows,
  getRowKey,
}: PdfSimpleTableProps<T>) {
  return (
    <View style={pdfStyles.table}>
      <View style={[pdfStyles.row, pdfStyles.headerRow]}>
        {columns.map((column) => (
          <Text key={column.key} style={[pdfStyles.cell, column.style]}>
            {column.label}
          </Text>
        ))}
      </View>

      {rows.map((row, index) => (
        <View
          key={getRowKey(row, index)}
          style={
            index === rows.length - 1
              ? [pdfStyles.row, pdfStyles.lastRow]
              : pdfStyles.row
          }
        >
          {columns.map((column) => (
            <Text key={column.key} style={[pdfStyles.cell, column.style]}>
              {column.render(row)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
