import type { ReactNode } from "react";
import "./detalhes-ui.css";

type Props = { rotulo: string; children: ReactNode };

/** Par rótulo/valor para as páginas de consulta e detalhes. */
export default function DadoDetalhe({ rotulo, children }: Props) {
    return (
        <div className="sice-detalhes__dado">
            <dt>{rotulo}</dt>
            <dd>{children}</dd>
        </div>
    );
}
