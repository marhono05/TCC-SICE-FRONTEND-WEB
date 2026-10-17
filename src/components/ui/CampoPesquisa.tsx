import { useId } from "react";
import "./listagem-ui.css";

type Props = {
    valor: string;
    aoAlterar: (valor: string) => void;
    rotulo: string;
    placeholder?: string;
    desabilitado?: boolean;
};

/** Pesquisa controlada; não dispara chamadas adicionais à API. */
export default function CampoPesquisa({
    valor, aoAlterar, rotulo, placeholder = "Pesquisar...", desabilitado = false,
}: Props) {
    const id = useId();

    return (
        <div className="sice-pesquisa">
            <label className="sice-pesquisa__rotulo" htmlFor={id}>{rotulo}</label>
            <div className="sice-pesquisa__campo">
                <i className="bi bi-search" aria-hidden="true" />
                <input
                    id={id}
                    type="search"
                    value={valor}
                    placeholder={placeholder}
                    onChange={(evento) => aoAlterar(evento.target.value)}
                    autoComplete="off"
                    disabled={desabilitado}
                />
                {valor && (
                    <button type="button" onClick={() => aoAlterar("")}
                        disabled={desabilitado} aria-label="Limpar pesquisa" title="Limpar pesquisa">
                        <i className="bi bi-x-lg" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    );
}
