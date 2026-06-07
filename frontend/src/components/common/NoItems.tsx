import { SearchOffRounded } from "@mui/icons-material";
import EmptyState from "./EmptyState";

interface NoItemsProps {
  message?: string;
}

const NoItems = ({ message = "No items found." }: NoItemsProps) => {
  return <EmptyState icon={SearchOffRounded} message={message} />;
};

export default NoItems;

