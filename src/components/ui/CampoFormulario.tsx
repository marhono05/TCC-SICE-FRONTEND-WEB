import type { ReactNode } from "react";
import "./formulario-ui.css";

type Props = {
    id: string;
    rotulo: string;
    children: ReactNode;
    erro?: string;
    ajuda?: string;
    obrigatorio?: boolean;
    className?: string;
};

/** Composição visual. O controle permanece gerenciado pelo formulário pai. */
export default function CampoFormulario({
    id, rotulo, children, erro, ajuda, obrigatorio = false, className = ""
}: Props) {
    return (
        <div className={`sice-campo ${className}`.trim()}>
            <label className="sice-campo__rotulo" htmlFor={id}>
                {rotulo}
                {obrigatorio && <span aria-hidden="true" className="sice-campo__obrigatorio"> *</span>}
            </label>
            {children}
            {ajuda && <p className="sice-campo__ajuda" id={`${id}-ajuda`}>{ajuda}</p>}
            {erro && <p className="sice-campo__erro" id={`${id}-erro`} role="alert">{erro}</p>}
        </div>
    );
}
