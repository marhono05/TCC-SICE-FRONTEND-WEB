import type { StatusEnvioAviso } from "../../types/envioAviso";
import "../../pages/admin/avisos/ListarAvisos/avisos.css";

type Props = {
  status: StatusEnvioAviso;
  contexto?: "envio" | "cancelamento";
};

const ROTULOS: Record<"envio" | "cancelamento", Record<StatusEnvioAviso, string>> = {
  envio: {
    PENDENTE: "Pendente",
    ENVIADO: "Processado pelo bot",
    ERRO: "Erro",
    CANCELADO: "Interrompido",
  },
  cancelamento: {
    PENDENTE: "Aguardando processamento",
    ENVIADO: "Confirmado pelo bot",
    ERRO: "Sem confirmação",
    CANCELADO: "Não processado",
  },
};

const ICONES: Record<StatusEnvioAviso, string> = {
  PENDENTE: "bi-clock-history",
  ENVIADO: "bi-check-circle",
  ERRO: "bi-exclamation-triangle",
  CANCELADO: "bi-dash-circle",
};

/** Estado textual e visual; confirmação pelo bot não significa entrega no WhatsApp. */
export default function EtiquetaStatusAviso({ status, contexto = "envio" }: Props) {
  return (
    <span className={`sice-avisos__status sice-avisos__status--${status.toLowerCase()}`}>
      <i className={`bi ${ICONES[status]}`} aria-hidden="true" />
      {ROTULOS[contexto][status]}
    </span>
  );
}
