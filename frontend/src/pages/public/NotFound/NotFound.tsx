import { PublicStatusPage } from "../PublicStatusPage";

export default function NotFound(): JSX.Element {
  return (
    <PublicStatusPage
      code="404"
      title="Página no encontrada"
      message="El recurso que buscás no existe o fue movido."
      linkLabel="Volver"
    />
  );
}


