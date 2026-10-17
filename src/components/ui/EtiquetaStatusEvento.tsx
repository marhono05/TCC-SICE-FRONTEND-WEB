import type { Evento } from "../../types/evento";
import "./listagem-grupos-eventos.css";

const situacoes: Record<Evento["status"], { rotulo: string; icone: string }> = {
    ATIVO: { rotulo: "Ativo", icone: "bi-check-circle" },
    CANCELADO: { rotulo: "Cancelado", icone: "bi-x-circle" },
    DESATIVADO: { rotulo: "Desativado", icone: "bi-dash-circle" },
};

/** Mantém o status dos eventos legível também sem depender da cor. */
export default function EtiquetaStatusEvento({ status }: { status: Evento["status"] }) {
    const situacao = situacoes[status];
    return (
        <span className={`sice-etiqueta-evento sice-etiqueta-evento--${status.toLowerCase()}`}>
            <i className={`bi ${situacao.icone}`} aria-hidden="true" />
            {situacao.rotulo}
        </span>
    );
}
