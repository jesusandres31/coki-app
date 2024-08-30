import { PromiseStatus } from "src/types";
import { productApi } from "src/app/services/productService";
import { useAppDispatch } from "src/app/store";
import {
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import DeleteModal from "src/components/common/Modals/DeleteModal";
import { MSG } from "src/utils/FormUtils";

interface DeleteProductsProps {
  open: boolean;
  label: string;
}

export default function DeleteProducts({ open, label }: DeleteProductsProps) {
  const dispatch = useAppDispatch();
  const { selectedItems } = useUISelector((state) => state.ui);
  const [deleteProduct, { isLoading: isDeleting }] =
    productApi.useDeleteProductMutation();

  const handleDelete = async () => {
    const res = await deleteProduct(selectedItems).unwrap();
    if (res.every((item) => item.status === PromiseStatus.FULFILLED)) {
      dispatch(resetSelectedItems());
      dispatch(setSnackbar({ message: MSG.successDelete(res.length) }));
    }
  };

  return (
    <DeleteModal
      open={open}
      label={label}
      hanleConfirm={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
