import { WarningRounded } from "@mui/icons-material";
import EmptyState from "./EmptyState";

const ErrorMsg = ({
  message = "Something went wrong.",
}: {
  message?: string;
}) => {
  return <EmptyState icon={WarningRounded} message={message} />;
};

export default ErrorMsg;

