import { PublicStatusPage } from "../PublicStatusPage";

export default function NotFound(): JSX.Element {
  return (
    <PublicStatusPage
      title="Acceso no autorizado"
      message="No tenés permisos para ingresar a esta sección."
      linkLabel="Volver al inicio"
    />
  );
}


