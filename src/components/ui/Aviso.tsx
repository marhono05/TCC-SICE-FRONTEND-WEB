import type { HTMLAttributes, ReactNode } from "react";
import "./formulario-ui.css";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
    variante: "informacao" | "sucesso" | "alerta" | "erro";
    titulo?: string;
    children: ReactNode;
};

const icones = {
    informacao: "bi-info-circle",
    sucesso: "bi-check-circle",
    alerta: "bi-exclamation-triangle",
    erro: "bi-exclamation-circle",
};

export default function Aviso({ variante, titulo, children, className = "", ...props }: Props) {
    return (
        <div {...props} className={`sice-aviso sice-aviso--${variante} ${className}`.trim()}>
            <i className={`bi ${icones[variante]}`} aria-hidden="true" />
            <div className="sice-aviso__conteudo">
                {titulo && <strong className="sice-aviso__titulo">{titulo}</strong>}
                {children}
            </div>
        </div>
    );
}
