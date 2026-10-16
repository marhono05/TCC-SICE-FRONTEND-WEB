import { useCallback, useEffect, useRef, useState } from "react";
import { mensagemErroApi } from "../utils/erroApi";

/** Gerencia carregamento, erro e atualização das listagens administrativas. */
export function useListagemAdmin<T>(buscar: () => Promise<T[]>) {
    const [itens, setItens] = useState<T[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const requisicaoAtual = useRef(0);

    const executarBusca = useCallback(async (requisicao: number) => {
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

    // Chamadas manuais (Atualizar, Tentar novamente) podem mudar o estado imediatamente.
    const carregar = useCallback(async () => {
        const requisicao = ++requisicaoAtual.current;
        setCarregando(true);
        setErro("");
        await executarBusca(requisicao);
    }, [executarBusca]);

    // A busca inicial parte do efeito; as atualizações acontecem após o retorno assíncrono.
    useEffect(() => {
        const requisicao = ++requisicaoAtual.current;
        void executarBusca(requisicao);
        return () => { requisicaoAtual.current += 1; };
    }, [executarBusca]);

    return { itens, carregando, erro, carregar };
}
