import type { ReactNode } from "react";
import "./formulario-ui.css";

type Props = {
    id: string;
    titulo: string;
    descricao?: string;
    icone: string;
    children: ReactNode;
    className?: string;
};

/** Cartão com cabeçalho padronizado, sem interferir nos dados dos formulários. */
export default function SecaoFormulario({
    id, titulo, descricao, icone, children, className = ""
}: Props) {
    return (
        <section className={`sice-secao-formulario ${className}`.trim()} aria-labelledby={id}>
            <div className="sice-secao-formulario__cabecalho">
                <span className="sice-secao-formulario__icone">
                    <i className={`bi ${icone}`} aria-hidden="true" />
                </span>
                <div>
                    <h2 id={id}>{titulo}</h2>
                    {descricao && <p>{descricao}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}
