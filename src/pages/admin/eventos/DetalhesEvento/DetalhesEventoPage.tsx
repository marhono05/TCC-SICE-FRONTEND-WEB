import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { buscarEventoPorId } from "../../../../services/eventoService";
import { listarTurma } from "../../../../services/turmaService";
import type { Evento } from "../../../../types/evento";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";
import ConfirmarCancelamentoEvento from "../../../../components/ConfirmarCancelamento/ConfirmarCancelamentoEvento";

const etapas = { PRIMEIRA: "1ª", SEGUNDA: "2ª", TERCEIRA: "3ª" };
const modalidades = { MEDIO: "Ensino Médio", TECNICO: "Ensino Técnico" };

export default function DetalhesEventoPage() {
    const { id } = useParams();
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;
    const eventoId = Number(id);
    const idValido = Number.isSafeInteger(eventoId) && eventoId > 0;
    const [evento, setEvento] = useState<Evento | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
    const [avisoCancelamento, setAvisoCancelamento] = useState("");

    useEffect(() => {
        if (!idValido) return;
        let ativo = true;
        async function carregar() {
            setLoading(true);
            setErro("");
            try {
                // Os detalhes do evento funcionam mesmo se a lista auxiliar de turmas falhar.
                const dados = await buscarEventoPorId(eventoId);
                if (ativo) setEvento(dados);
                try {
                    const lista = await listarTurma();
                    if (ativo) setTurmas(lista);
                } catch {
                    // A visualização continua mostrando os IDs das turmas.
                }
            } catch (falha) {
                if (ativo) setErro(mensagemErroApi(falha, "Não foi possível carregar o evento."));
            } finally {
                if (ativo) setLoading(false);
            }
        }
        void carregar();
        return () => { ativo = false; };
    }, [eventoId, idValido, tentativa]);

    function nomeTurma(turmaId: number) {
        const turma = turmas.find((t) => t.id === turmaId);
        return turma ? `${turma.cursoNome} · ${turma.anoLetivo} · ${turma.modalidade} · ${turma.etapa}` : `Turma #${turmaId}`;
    }

    return (
        <main>
            <h1>Detalhes do evento</h1>
            <p><Link to="/gerenciarEventos">Voltar para a listagem</Link></p>
            {aviso && <p role="status">{aviso}</p>}
            {avisoCancelamento && <p role="status">{avisoCancelamento}</p>}
            {!idValido && <p role="alert">Identificador de evento inválido.</p>}
            {idValido && loading && <p role="status">Carregando evento...</p>}
            {idValido && !loading && erro && (
                <div role="alert"><p>{erro}</p><button type="button" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</button></div>
            )}
            {idValido && !loading && !erro && !evento && <p>Evento não encontrado.</p>}
            {idValido && !loading && !erro && evento && (
                <article>
                    <h2>{evento.titulo}</h2>
                    <p><strong>Descrição:</strong> {evento.descricao}</p>
                    <p><strong>Data e hora:</strong> {evento.dataInicio} às {evento.horaInicio.slice(0, 5)}</p>
                    <p><strong>Data do aviso:</strong> {evento.dataAviso}</p>
                    <p><strong>Status:</strong> {evento.status}</p>
                    <p><strong>Criado pelo usuário:</strong> #{evento.criadoPor}</p>
                    <h3>Destinatários</h3>
                    {evento.destinos.map((destino) => (
                        <section key={destino.id ?? destino.perfil}>
                            <h4>{destino.perfil === "ALUNO" ? "Alunos" : "Professores"}</h4>
                            {destino.perfil === "ALUNO" && (
                                <>
                                    <p><strong>Etapas:</strong> {destino.etapas.length ? destino.etapas.map((v) => etapas[v]).join(", ") : "Todas"}</p>
                                    <p><strong>Modalidades:</strong> {destino.modalidades.length ? destino.modalidades.map((v) => modalidades[v]).join(", ") : "Todas"}</p>
                                    <p><strong>Turmas:</strong> {destino.turmasIds.length ? destino.turmasIds.map(nomeTurma).join("; ") : "Todas (respeitando os filtros acima)"}</p>
                                </>
                            )}
                        </section>
                    ))}
                    {evento.status === "ATIVO" && (
                        <p><button type="button" onClick={() => setConfirmandoCancelamento(true)}>Cancelar evento</button></p>
                    )}
                    <p><Link to={`/editarEventos/${evento.id}`}>Editar evento</Link></p>
                    <p><Link to={`/avisos?aba=cancelamentos&eventoId=${evento.id}`}>Consultar comunicações de cancelamento na Central de Avisos</Link></p>
                </article>
            )}
            {confirmandoCancelamento && evento && (
                <ConfirmarCancelamentoEvento
                    evento={evento}
                    onFechar={() => setConfirmandoCancelamento(false)}
                    onConcluido={(atualizado, mensagem) => {
                        setEvento(atualizado);
                        setAvisoCancelamento(mensagem);
                        setConfirmandoCancelamento(false);
                    }}
                />
            )}
        </main>
    );
}
