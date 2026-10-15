import { useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useListagemAdmin } from "../../../../hooks/useListagemAdmin";
import { alterarStatusCurso, listarCurso } from "../../../../services/cursoService";
import type { Curso } from "../../../../types/curso";
import { mensagemErroApi } from "../../../../utils/erroApi";

export default function ListarCursosPage() {
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;
    const buscar = useCallback(() => listarCurso(), []);
    const { itens: cursos, carregando, erro, carregar } = useListagemAdmin(buscar);
    const [processando, setProcessando] = useState<number | null>(null);
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");

    async function alterarStatus(curso: Curso) {
        if (processando !== null) return;
        if (!window.confirm(`Deseja ${curso.ativo ? "desativar" : "reativar"} o curso ${curso.nome}?`)) return;
        setProcessando(curso.id); setErroAcao(""); setSucesso("");
        try {
            await alterarStatusCurso(curso.id, !curso.ativo);
            await carregar();
            setSucesso("Status do curso atualizado com sucesso.");
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status do curso."));
        } finally { setProcessando(null); }
    }

    return <main>
        <h1>Gerenciar Cursos</h1>
        <p><NavLink to="/cadastrarCursos">Cadastrar curso</NavLink></p>
        {aviso && <p role="status">{aviso}</p>}{sucesso && <p role="status">{sucesso}</p>}
        {erroAcao && <p role="alert">{erroAcao}</p>}
        {erro && <div role="alert"><p>{erro}</p><button type="button" onClick={() => void carregar()}>Tentar novamente</button></div>}
        <table><thead><tr><th>ID</th><th>Nome</th><th>Status</th><th>Ações</th></tr></thead><tbody>
            {carregando ? <tr><td colSpan={4}>Carregando cursos...</td></tr>
                : erro ? null : cursos.length === 0 ? <tr><td colSpan={4}>Nenhum curso cadastrado.</td></tr>
                : cursos.map(curso => <tr key={curso.id}><td>{curso.id}</td><td>{curso.nome}</td>
                    <td>{curso.ativo ? "Ativo" : "Inativo"}</td><td>
                        <NavLink to={`/editarCursos/${curso.id}`}>Editar</NavLink>{" | "}
                        <button type="button" disabled={processando !== null} onClick={() => void alterarStatus(curso)}>
                            {processando === curso.id ? "Atualizando..." : curso.ativo ? "Desativar" : "Reativar"}
                        </button></td></tr>)}
        </tbody></table>
    </main>;
}
