import { useCallback, useEffect, useRef, useState } from "react";
import { mensagemErroApi } from "../utils/erroApi";

/** Gerencia carregamento, erro e atualização das listagens administrativas. */
export function useListagemAdmin<T>(buscar: () => Promise<T[]>) {
    const [itens, setItens] = useState<T[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const requisicaoAtual = useRef(0);

    const carregar = useCallback(async () => {
        const requisicao = ++requisicaoAtual.current;
        setCarregando(true);
        setErro("");
        try {
            const dados = await buscar();
            if (requisicao === requisicaoAtual.current) setItens(dados);
        } catch (falha) {
            if (requisicao === requisicaoAtual.current) {
                setErro(mensagemErroApi(falha, "Não foi possível carregar os registros."));
            }
        } finally {
            if (requisicao === requisicaoAtual.current) setCarregando(false);
        }
    }, [buscar]);

    useEffect(() => {
        void carregar();
        return () => { requisicaoAtual.current += 1; };
    }, [carregar]);

    return { itens, carregando, erro, carregar };
}
