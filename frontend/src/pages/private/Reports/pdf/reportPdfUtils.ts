import { PdfSimpleTableColumn } from "src/components/common/pdf";

interface ProductUnitPdfRow {
  productName: string;
  measureUnitName: string;
}

export const buildProductUnitPdfColumns = <T extends ProductUnitPdfRow>(
  productCellStyle: any,
  unitCellStyle: any,
): PdfSimpleTableColumn<T>[] => [
  {
    key: "product",
    label: "Producto",
    style: productCellStyle,
    render: (item) => item.productName,
  },
  {
    key: "unit",
    label: "Unidad",
    style: unitCellStyle,
    render: (item) => item.measureUnitName,
  },
];
