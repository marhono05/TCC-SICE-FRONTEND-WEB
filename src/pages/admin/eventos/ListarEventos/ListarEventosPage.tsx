import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import type { Evento } from "../../../../types/evento";
import { cancelarEvento, listarTodos, reativarEvento, desativarEvento } from "../../../../services/eventoService";
import { mensagemErroApi } from "../../../../utils/erroApi";

type AcaoEvento = "cancelar" | "desativar" | "reativar";

export default function ListarEventosPage() {
    const location = useLocation();
    const avisoNavegacao = (location.state as { aviso?: string } | null)?.aviso;
    const [loading, setLoading] = useState(true);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState(avisoNavegacao ?? "");
    const [processandoId, setProcessandoId] = useState<number | null>(null);

    const carregarEventos = useCallback(async () => {
        setLoading(true);
        setErro("");
        try {
            setEventos(await listarTodos());
        } catch (falha) {
            setErro(mensagemErroApi(falha, "Não foi possível listar os eventos."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void carregarEventos(); }, [carregarEventos]);

    async function executarAcao(evento: Evento, acao: AcaoEvento) {
        if (processandoId !== null) return;
        const confirmacao = acao === "cancelar"
            ? "Deseja cancelar este evento?"
            : acao === "desativar"
                ? "Deseja desativar este evento?"
                : "Deseja reativar este evento?";
        if (!window.confirm(confirmacao)) return;

        setErro("");
        setAviso("");
        setProcessandoId(evento.id);
        try {
            const atualizado = acao === "cancelar"
                ? await cancelarEvento(evento.id)
                : acao === "desativar"
                    ? await desativarEvento(evento.id)
                    : await reativarEvento(evento.id);
            setEventos((atuais) => atuais.map((item) => item.id === atualizado.id ? atualizado : item));
            setAviso(`Evento ${acao === "cancelar" ? "cancelado" : acao === "desativar" ? "desativado" : "reativado"} com sucesso.`);
        } catch (falha) {
            setErro(mensagemErroApi(falha, "Não foi possível alterar o status do evento."));
        } finally {
            setProcessandoId(null);
        }
    }

    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    return (
        <main>
            <h1>Gerenciar eventos</h1>
            <p><Link to="/cadastrarEventos">Cadastrar evento</Link></p>
            {aviso && <p role="status">{aviso}</p>}
            {erro && <div role="alert"><p>{erro}</p><button type="button" onClick={() => void carregarEventos()}>Tentar novamente</button></div>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Título</th><th>Data</th><th>Hora</th><th>Status</th><th>Destinos</th><th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={7}>Carregando eventos...</td></tr>
                    ) : !erro && eventos.length === 0 ? (
                        <tr><td colSpan={7}>Nenhum evento cadastrado.</td></tr>
                    ) : !erro ? eventos.map((evento) => (
                        <tr key={evento.id}>
                            <td>{evento.id}</td>
                            <td>{evento.titulo}</td>
                            <td>{evento.dataInicio}</td>
                            <td>{evento.horaInicio.slice(0, 5)}</td>
                            <td>{evento.status}</td>
                            <td>{evento.destinos.map((d) => d.perfil === "ALUNO" ? "Alunos" : "Professores").join(", ")}</td>
                            <td>
                                <Link to={`/eventos/${evento.id}`}>Ver</Link>{" | "}
                                <Link to={`/editarEventos/${evento.id}`}>Editar</Link>{" | "}
                                <button type="button" disabled={processandoId !== null || evento.status !== "ATIVO"} onClick={() => void executarAcao(evento, "cancelar")}>Cancelar</button>{" "}
                                <button type="button" disabled={processandoId !== null || evento.status === "DESATIVADO"} onClick={() => void executarAcao(evento, "desativar")}>Desativar</button>{" "}
                                <button type="button" disabled={processandoId !== null || evento.status === "ATIVO" || evento.dataInicio < dataHoje} onClick={() => void executarAcao(evento, "reativar")}>Reativar</button>
                                {processandoId === evento.id && <span role="status"> Atualizando...</span>}
                            </td>
                        </tr>
                    )) : null}
                </tbody>
            </table>
        </main>
    );
}
