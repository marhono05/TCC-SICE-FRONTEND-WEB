import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { buscarEventoPorId, excluirEvento } from "../../../../services/eventoService";
import { listarTurma } from "../../../../services/turmaService";
import type { Evento } from "../../../../types/evento";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";
import ConfirmarCancelamentoEvento from "../../../../components/eventos/ConfirmarCancelamentoEvento";
import { formatarDataAviso } from "../../../../utils/datasAvisos";
import EtiquetaStatusEvento from "../../../../components/eventos/EtiquetaStatusEvento";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import SecaoFormulario from "../../../../components/ui/SecaoFormulario";
import DadoDetalhe from "../../../../components/ui/DadoDetalhe";
import Botao from "../../../../components/ui/Botao";
import Aviso from "../../../../components/ui/Aviso";
import "../../../../components/ui/detalhes-ui.css";


const etapas = { PRIMEIRA: "1ª", SEGUNDA: "2ª", TERCEIRA: "3ª" };
const modalidades = { MEDIO: "Ensino Médio", TECNICO: "Ensino Técnico" };

export default function DetalhesEventoPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
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
    const [excluindo, setExcluindo] = useState(false);
    const [erroExclusao, setErroExclusao] = useState("");

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

    async function confirmarExclusao() {
        if (!evento || excluindo) return;
        if (!window.confirm(
            `Excluir definitivamente o evento "${evento.titulo}"?\n\n` +
            "Só é possível excluir eventos sem nenhum registro de aviso."
        )) return;
        setErroExclusao("");
        setExcluindo(true);
        try {
            await excluirEvento(evento.id);
            navigate("/gerenciarEventos", { replace: true, state: { aviso: "Evento excluído definitivamente." } });
        } catch (falha) {
            setErroExclusao(mensagemErroApi(falha, "Não foi possível excluir o evento."));
        } finally {
            setExcluindo(false);
        }
    }

    function nomeTurma(turmaId: number) {
        const turma = turmas.find((t) => t.id === turmaId);
        return turma ? `${turma.cursoNome} · ${turma.anoLetivo} · ${turma.modalidade} · ${turma.etapa}` : `Turma #${turmaId}`;
    }

    return (
        <main className="sice-detalhes">
            <CabecalhoListagem
                titulo="Detalhes do evento"
                descricao="Consulte as informações, os destinatários e as comunicações do evento."
                icone="bi-calendar-event"
                acao={<Link className="sice-detalhes__voltar" to="/gerenciarEventos"><i className="bi bi-arrow-left" aria-hidden="true" /> Voltar aos eventos</Link>}
            />

            {aviso && <Aviso variante="informacao" role="status">{aviso}</Aviso>}
            {avisoCancelamento && <Aviso variante="sucesso" role="status">{avisoCancelamento}</Aviso>}
            {erroExclusao && <Aviso variante="erro" role="alert">{erroExclusao}</Aviso>}
            {!idValido && <Aviso variante="erro" role="alert">Identificador de evento inválido.</Aviso>}
            {idValido && loading && <p className="sice-detalhes__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" /> Carregando evento...</p>}
            {idValido && !loading && erro && (
                <Aviso variante="erro" role="alert" titulo="Não foi possível carregar o evento">
                    <p>{erro}</p>
                    <div className="sice-detalhes__aviso-acoes"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</Botao></div>
                </Aviso>
            )}
            {idValido && !loading && !erro && !evento && <Aviso variante="informacao">Evento não encontrado.</Aviso>}
            {idValido && !loading && !erro && evento && (
                <article className="sice-detalhes__corpo">
                    <SecaoFormulario id="detalhes-evento-dados" titulo="Informações do evento" descricao="Dados registrados no calendário escolar." icone="bi-calendar-check">
                        <div className="sice-detalhes__destaque">
                            <div className="sice-detalhes__destaque-texto">
                                <h3>{evento.titulo}</h3>
                                <p>Evento #{evento.id}</p>
                            </div>
                            <EtiquetaStatusEvento status={evento.status} />
                        </div>
                        <div className="sice-detalhes__texto-longo">
                            <strong>Descrição</strong>
                            <p>{evento.descricao}</p>
                        </div>
                        <dl className="sice-detalhes__dados">
                            <DadoDetalhe rotulo="Data do evento">{formatarDataAviso(evento.dataInicio)}</DadoDetalhe>
                            <DadoDetalhe rotulo="Horário">{evento.horaInicio.slice(0, 5)}</DadoDetalhe>
                            <DadoDetalhe rotulo="Data do aviso">{formatarDataAviso(evento.dataAviso)}</DadoDetalhe>
                            <DadoDetalhe rotulo="Criado pelo usuário">#{evento.criadoPor}</DadoDetalhe>
                        </dl>
                    </SecaoFormulario>
                    <SecaoFormulario id="detalhes-evento-destinatarios" titulo="Destinatários" descricao="Públicos associados a este evento." icone="bi-people">
                        {evento.destinos.length === 0 ? (
                            <Aviso variante="informacao">Nenhum destinatário associado ao evento.</Aviso>
                        ) : (
                            <div className="sice-detalhes__destinos">
                                {evento.destinos.map((destino) => (
                                    <section className="sice-detalhes__destino" key={destino.id ?? destino.perfil}>
                                        <h3><i className={`bi ${destino.perfil === "ALUNO" ? "bi-mortarboard" : "bi-person-workspace"}`} aria-hidden="true" /> {destino.perfil === "ALUNO" ? "Alunos" : "Professores"}</h3>
                                        {destino.perfil === "ALUNO" && (
                                            <dl className="sice-detalhes__dados">
                                                <DadoDetalhe rotulo="Etapas">{destino.etapas.length ? destino.etapas.map((v) => etapas[v]).join(", ") : "Todas"}</DadoDetalhe>
                                                <DadoDetalhe rotulo="Modalidades">{destino.modalidades.length ? destino.modalidades.map((v) => modalidades[v]).join(", ") : "Todas"}</DadoDetalhe>
                                                <DadoDetalhe rotulo="Turmas">{destino.turmasIds.length ? destino.turmasIds.map(nomeTurma).join("; ") : "Todas (respeitando os filtros acima)"}</DadoDetalhe>
                                            </dl>
                                        )}
                                    </section>
                                ))}
                            </div>
                        )}
                    </SecaoFormulario>
                    <section className="sice-detalhes__acoes-painel" aria-label="Ações do evento">
                        <div>
                            <h2>Ações do evento</h2>
                            <p>Gerencie o evento ou consulte os avisos de cancelamento.</p>
                        </div>
                        <div className="sice-detalhes__acoes">
                            <Link className="sice-detalhes__link" to={`/editarEventos/${evento.id}`}><i className="bi bi-pencil-square" aria-hidden="true" /> Editar evento</Link>
                            <Link className="sice-detalhes__link" to={`/avisos?aba=cancelamentos&eventoId=${evento.id}`}><i className="bi bi-megaphone" aria-hidden="true" /> Comunicações de cancelamento</Link>
                            {evento.status === "ATIVO" && <Botao type="button" variante="perigo" icone="bi-calendar-x" onClick={() => setConfirmandoCancelamento(true)}>Cancelar evento</Botao>}
                            <Botao type="button" variante="secundario" icone="bi-trash" disabled={excluindo} onClick={() => void confirmarExclusao()}>{excluindo ? "Excluindo..." : "Excluir evento"}</Botao>
                        </div>
                    </section>
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
