import type { ReactNode } from "react";
import "./listagem-ui.css";

type Props = {
    titulo: string;
    descricao: string;
    icone: string;
    acao?: ReactNode;
};

/** Cabeçalho compartilhado das listagens administrativas do SICE. */
export default function CabecalhoListagem({ titulo, descricao, icone, acao }: Props) {
    return (
        <header className="sice-listagem__cabecalho">
            <div className="sice-listagem__identidade">
                <span className="sice-listagem__icone" aria-hidden="true">
                    <i className={`bi ${icone}`} />
                </span>
                <div className="sice-listagem__titulos">
                    <h1>{titulo}</h1>
                    <p>{descricao}</p>
                </div>
            </div>
            {acao && <div className="sice-listagem__cabecalho-acao">{acao}</div>}
        </header>
    );
}
