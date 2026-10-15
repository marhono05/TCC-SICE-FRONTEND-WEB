import { useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useListagemAdmin } from "../../../../hooks/useListagemAdmin";
import { alterarStatusGrupo, listarTodos } from "../../../../services/grupoWhatsappService";
import type { GrupoWhatsapp } from "../../../../types/grupoWhatsapp";
import { mensagemErroApi } from "../../../../utils/erroApi";

const rotuloTipo: Record<GrupoWhatsapp["tipo"], string> = {
    GERAL_ALUNOS: "Geral dos alunos", GERAL_PROFESSORES: "Geral dos professores", TURMA: "Turma"
};

export default function ListarGruposWhatsappPage() {
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;
    const buscar = useCallback(() => listarTodos(), []);
    const { itens: grupos, carregando, erro, carregar } = useListagemAdmin(buscar);
    const [processando, setProcessando] = useState<number | null>(null);
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");

    async function alterarStatus(grupo: GrupoWhatsapp) {
        if (processando !== null) return;
        if (!window.confirm(`Deseja ${grupo.ativo ? "desativar" : "reativar"} o grupo ${grupo.nome}?`)) return;
        setProcessando(grupo.id); setErroAcao(""); setSucesso("");
        try {
            await alterarStatusGrupo(grupo.id, !grupo.ativo);
            await carregar();
            setSucesso("Status do grupo atualizado com sucesso.");
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status do grupo."));
        } finally { setProcessando(null); }
    }

    return <main>
        <h1>Grupos do WhatsApp</h1>
        <p><NavLink to="/grupos-whatsapp/cadastrar">Cadastrar grupo</NavLink></p>
        {aviso && <p role="status">{aviso}</p>}{sucesso && <p role="status">{sucesso}</p>}
        {erroAcao && <p role="alert">{erroAcao}</p>}
        {erro && <div role="alert"><p>{erro}</p><button type="button" onClick={() => void carregar()}>Tentar novamente</button></div>}
        <table><thead><tr><th>Nome</th><th>Identificador</th><th>Tipo</th><th>Turma</th><th>Status</th><th>Ações</th></tr></thead><tbody>
            {carregando ? <tr><td colSpan={6}>Carregando grupos...</td></tr>
                : erro ? null : grupos.length === 0 ? <tr><td colSpan={6}>Nenhum grupo cadastrado.</td></tr>
                : grupos.map(grupo => <tr key={grupo.id}><td>{grupo.nome}</td><td>{grupo.identificador}</td>
                    <td>{rotuloTipo[grupo.tipo]}</td><td>{grupo.turmaDescricao ?? "—"}</td><td>{grupo.ativo ? "Ativo" : "Inativo"}</td>
                    <td><NavLink to={`/grupos-whatsapp/editar/${grupo.id}`}>Editar</NavLink>{" | "}
                        <button type="button" disabled={processando !== null} onClick={() => void alterarStatus(grupo)}>
                            {processando === grupo.id ? "Atualizando..." : grupo.ativo ? "Desativar" : "Reativar"}
                        </button></td>
                </tr>)}
        </tbody></table>
    </main>;
}
