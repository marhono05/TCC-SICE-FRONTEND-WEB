import { useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useListagemAdmin } from "../../../../hooks/useListagemAdmin";
import { alterarStatusTurma, listarTurma } from "../../../../services/turmaService";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";

export default function ListarTurmasPage() {
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;
    const buscar = useCallback(() => listarTurma(), []);
    const { itens: turmas, carregando, erro, carregar } = useListagemAdmin(buscar);
    const [processando, setProcessando] = useState<number | null>(null);
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");

    async function alterarStatus(turma: Turma) {
        if (processando !== null) return;
        if (!window.confirm(`Deseja ${turma.ativo ? "desativar" : "reativar"} esta turma?`)) return;
        setProcessando(turma.id); setErroAcao(""); setSucesso("");
        try {
            await alterarStatusTurma(turma.id, !turma.ativo);
            await carregar();
            setSucesso("Status da turma atualizado com sucesso.");
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status da turma."));
        } finally { setProcessando(null); }
    }
    return <main>
        <h1>Gerenciar Turmas</h1>
        <p><NavLink to="/cadastrarTurmas">Cadastrar turma</NavLink></p>
        {aviso && <p role="status">{aviso}</p>}{sucesso && <p role="status">{sucesso}</p>}
        {erroAcao && <p role="alert">{erroAcao}</p>}
        {erro && <div role="alert"><p>{erro}</p><button type="button" onClick={() => void carregar()}>Tentar novamente</button></div>}
        <table><thead><tr><th>ID</th><th>Ano letivo</th><th>Curso</th><th>Modalidade</th><th>Etapa</th><th>Status</th><th>Ações</th></tr></thead><tbody>
            {carregando ? <tr><td colSpan={7}>Carregando turmas...</td></tr>
                : erro ? null : turmas.length === 0 ? <tr><td colSpan={7}>Nenhuma turma cadastrada.</td></tr>
                : turmas.map(turma => <tr key={turma.id}><td>{turma.id}</td><td>{turma.anoLetivo}</td>
                    <td>{turma.cursoNome}</td><td>{turma.modalidade}</td><td>{turma.etapa}</td><td>{turma.ativo ? "Ativa" : "Inativa"}</td>
                    <td><NavLink to={`/editarTurmas/${turma.id}`}>Editar</NavLink>{" | "}
                        <button type="button" disabled={processando !== null} onClick={() => void alterarStatus(turma)}>
                            {processando === turma.id ? "Atualizando..." : turma.ativo ? "Desativar" : "Reativar"}
                        </button>
                    </td></tr>)}
        </tbody></table>
    </main>;
}
