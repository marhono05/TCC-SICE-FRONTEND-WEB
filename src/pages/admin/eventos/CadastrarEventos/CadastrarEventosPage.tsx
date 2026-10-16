import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { listarTurma } from "../../../../services/turmaService";
import { cadastrarEvento } from "../../../../services/eventoService";
import { mensagemErroApi } from "../../../../utils/erroApi";
import type { Turma } from "../../../../types/turmas";
import type { CriarEvento } from "../../../../types/evento";
import type { EventoFormData } from "../../../../schemas/eventoSchema";
import FormEvento from "../../../../components/FormEvento/FormEvento";

export default function CadastrarEventosPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dataRecebida = searchParams.get("data") ?? "";
    const dataInicial = /^\d{4}-\d{2}-\d{2}$/.test(dataRecebida) ? dataRecebida : "";
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregandoTurmas, setCarregandoTurmas] = useState(true);
    const [erroTurmas, setErroTurmas] = useState("");
    const [erroCadastro, setErroCadastro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        let ativo = true;
        async function carregarTurmas() {
            setCarregandoTurmas(true);
            setErroTurmas("");
            try {
                const dados = await listarTurma();
                if (ativo) setTurmas(dados);
            } catch (erro) {
                if (ativo) setErroTurmas(mensagemErroApi(erro, "Não foi possível carregar as turmas."));
            } finally {
                if (ativo) setCarregandoTurmas(false);
            }
        }
        void carregarTurmas();
        return () => { ativo = false; };
    }, [tentativa]);

    async function cadastrar(dados: EventoFormData) {
        setErroCadastro("");
        const novoEvento: CriarEvento = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            dataInicio: dados.dataInicio,
            horaInicio: dados.horaInicio,
            destinos: dados.destinos
        };
        try {
            setSalvando(true);
            const evento = await cadastrarEvento(novoEvento);
            navigate(`/eventos/${evento.id}`, {
                replace: true,
                state: { aviso: "Evento cadastrado com sucesso!" }
            });
        } catch (erro) {
            setErroCadastro(mensagemErroApi(erro, "Não foi possível cadastrar o evento."));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main>
            <h1>Cadastro de eventos</h1>
            <p><Link to="/gerenciarEventos">Voltar para a listagem</Link></p>
            {carregandoTurmas && <p role="status">Carregando turmas...</p>}
            {!carregandoTurmas && erroTurmas && (
                <div role="alert">
                    <p>{erroTurmas}</p>
                    <button type="button" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</button>
                </div>
            )}
            {!carregandoTurmas && !erroTurmas && (
                <>
                    {erroCadastro && <p role="alert">{erroCadastro}</p>}
                    <FormEvento turmas={turmas} dataInicial={dataInicial} onSubmit={cadastrar} salvando={salvando} />
                </>
            )}
        </main>
    );
}
