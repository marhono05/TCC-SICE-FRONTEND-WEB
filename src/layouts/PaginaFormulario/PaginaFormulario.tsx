import type { ReactNode } from "react";
import { Link } from "react-router";
import "./PaginaFormulario.css";

type Props = {
    titulo: string;
    descricao: string;
    icone: string;
    voltarPara: string;
    textoVoltar: string;
    acao?: ReactNode;
    children: ReactNode;
};

/** Estrutura externa compartilhada pelas páginas de cadastro e edição. */
export default function PaginaFormulario({
    titulo, descricao, icone, voltarPara, textoVoltar, acao, children
}: Props) {
    return (
        <main className="sice-pagina-formulario">
            <div className="sice-pagina-formulario__navegacao">
                <Link className="sice-pagina-formulario__voltar" to={voltarPara}>
                    <i className="bi bi-arrow-left" aria-hidden="true" />
                    <span>{textoVoltar}</span>
                </Link>
                {acao && <div className="sice-pagina-formulario__acao">{acao}</div>}
            </div>

            <header className="sice-pagina-formulario__cabecalho">
                <span className="sice-pagina-formulario__icone" aria-hidden="true">
                    <i className={`bi ${icone}`} />
                </span>
                <div className="sice-pagina-formulario__titulos">
                    <h1>{titulo}</h1>
                    <p>{descricao}</p>
                </div>
            </header>

            <div className="sice-pagina-formulario__conteudo">{children}</div>
        </main>
    );
}
