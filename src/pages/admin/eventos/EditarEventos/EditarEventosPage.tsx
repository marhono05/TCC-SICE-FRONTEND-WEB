import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { buscarEventoPorId, editarEvento } from "../../../../services/eventoService";
import { listarTurma } from "../../../../services/turmaService";
import type { EditarEvento, Evento } from "../../../../types/evento";
import type { Turma } from "../../../../types/turmas";
import type { EventoFormData } from "../../../../schemas/eventoSchema";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormEvento from "../../../../components/FormEvento/FormEvento";

export default function EditarEventosPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const eventoId = Number(id);
    const idValido = Number.isSafeInteger(eventoId) && eventoId > 0;

    const [evento, setEvento] = useState<Evento | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erroEdicao, setErroEdicao] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!idValido) { return; }
        let ativo = true;
        async function carregarDados() {
            setLoading(true);
            setErroCarregamento("");
            try {
                const [eventoEncontrado, turmasEncontradas] = await Promise.all([
                    buscarEventoPorId(eventoId), listarTurma()
                ]);
                if (ativo) {
                    setEvento(eventoEncontrado);
                    setTurmas(turmasEncontradas);
                }
            } catch (erro) {
                if (ativo) setErroCarregamento(mensagemErroApi(erro, "Não foi possível carregar o evento e as turmas."));
            } finally {
                if (ativo) setLoading(false);
            }
        }
        void carregarDados();
        return () => { ativo = false; };
    }, [eventoId, idValido, tentativa]);

    async function editar(dados: EventoFormData) {
        if (!idValido) return;
        setErroEdicao("");
        const atualizacao: EditarEvento = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            dataInicio: dados.dataInicio,
            horaInicio: dados.horaInicio,
            destinos: dados.destinos
        };
        try {
            setSalvando(true);
            await editarEvento(eventoId, atualizacao);
            navigate(`/eventos/${eventoId}`, {
                replace: true,
                state: { aviso: "Evento atualizado com sucesso!" }
            });
        } catch (erro) {
            setErroEdicao(mensagemErroApi(erro, "Não foi possível editar o evento."));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main>
            <h1>Editar evento</h1>
            <p><Link to="/gerenciarEventos">Voltar para a listagem</Link></p>
            {!idValido && <p role="alert">Identificador de evento inválido.</p>}
            {idValido && loading && <p role="status">Carregando evento...</p>}
            {idValido && !loading && erroCarregamento && (
                <div role="alert">
                    <p>{erroCarregamento}</p>
                    <button type="button" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</button>
                </div>
            )}
            {idValido && !loading && !erroCarregamento && !evento && <p>Evento não encontrado.</p>}
            {idValido && !loading && !erroCarregamento && evento && (
                <>
                    {erroEdicao && <p role="alert">{erroEdicao}</p>}
                    <FormEvento evento={evento} turmas={turmas} onSubmit={editar} salvando={salvando} />
                </>
            )}
        </main>
    );
}
