import "./listagem-ui.css";

type Props = {
    ativo: boolean;
    rotuloAtivo?: string;
    rotuloInativo?: string;
};

/** Indicador visual de status com texto (sem depender somente da cor). */
export default function EtiquetaStatus({
    ativo, rotuloAtivo = "Ativo", rotuloInativo = "Inativo",
}: Props) {
    return (
        <span className={`sice-etiqueta-status sice-etiqueta-status--${ativo ? "ativo" : "inativo"}`}>
            <i className={`bi ${ativo ? "bi-check-circle" : "bi-dash-circle"}`} aria-hidden="true" />
            {ativo ? rotuloAtivo : rotuloInativo}
        </span>
    );
}
