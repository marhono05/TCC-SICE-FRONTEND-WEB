import type { ButtonHTMLAttributes } from "react";
import "./formulario-ui.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variante?: "primario" | "secundario" | "perigo";
    icone?: string;
};

export default function Botao({
    variante = "primario", icone, children, className = "", ...props
}: Props) {
    return (
        <button
            {...props}
            className={`sice-botao sice-botao--${variante} ${className}`.trim()}
        >
            {icone && <i className={`bi ${icone}`} aria-hidden="true" />}
            <span>{children}</span>
        </button>
    );
}
