import { useUISelector } from "src/slices/ui/uiSlice";

export const useModal = () => {
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);

  const isUpdate = !!actionModal.update && selectedItems.length === 1;

  return { isUpdate };
};
