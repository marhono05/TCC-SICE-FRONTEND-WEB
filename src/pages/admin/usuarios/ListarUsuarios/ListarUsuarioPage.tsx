import { useCallback, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router";
import { useListagemAdmin } from "../../../../hooks/useListagemAdmin";
import { alterarStatusUsuario, listarPorPerfil } from "../../../../services/usuarioService";
import type { Usuario } from "../../../../types/usuario";
import { mensagemErroApi } from "../../../../utils/erroApi";
import { isPerfilUsuario, PERFIL_LABEL_PLURAL, PERFIL_LABEL_SINGULAR } from "../../../../utils/perfilUsuario";

export default function ListarUsuariosPage() {
    const { perfil } = useParams();
    const perfilValido = perfil && isPerfilUsuario(perfil) ? perfil : null;
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;
    const [processando, setProcessando] = useState<number | null>(null);
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");
    const buscar = useCallback(() => perfilValido ? listarPorPerfil(perfilValido) : Promise.resolve([] as Usuario[]), [perfilValido]);
    const { itens: usuarios, carregando, erro, carregar } = useListagemAdmin(buscar);

    async function alterarStatus(usuario: Usuario) {
        if (processando !== null) return;
        const acao = usuario.ativo ? "desativar" : "ativar";
        if (!window.confirm(`Deseja ${acao} ${usuario.nome}?`)) return;
        setErroAcao(""); setSucesso(""); setProcessando(usuario.id);
        try {
            await alterarStatusUsuario(usuario.id, !usuario.ativo);
            await carregar();
            setSucesso(`Usuário ${usuario.ativo ? "desativado" : "ativado"} com sucesso.`);
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status do usuário."));
        } finally { setProcessando(null); }
    }

    if (!perfilValido) return <p role="alert">Perfil inválido.</p>;
    return <main>
        <h1>Gerenciar {PERFIL_LABEL_PLURAL[perfilValido]}</h1>
        <nav aria-label="Perfis de usuários">
            <NavLink to="/gerenciarUsuarios/ALUNO">Alunos</NavLink>{" | "}
            <NavLink to="/gerenciarUsuarios/PROFESSOR">Professores</NavLink>{" | "}
            <NavLink to="/gerenciarUsuarios/SECRETARIA">Secretaria</NavLink>
        </nav>
        <p><NavLink to={`/cadastrarUsuario/${perfilValido}`}>Cadastrar {PERFIL_LABEL_SINGULAR[perfilValido]}</NavLink></p>
        {aviso && <p role="status">{aviso}</p>}
        {sucesso && <p role="status">{sucesso}</p>}
        {erroAcao && <p role="alert">{erroAcao}</p>}
        {erro && <div role="alert"><p>{erro}</p><button type="button" onClick={() => void carregar()}>Tentar novamente</button></div>}
        <table><thead><tr><th>Nome</th><th>Identificador</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>{carregando ? <tr><td colSpan={6}>Carregando usuários...</td></tr>
                : erro ? null
                : usuarios.length === 0 ? <tr><td colSpan={6}>Nenhum usuário cadastrado neste perfil.</td></tr>
                : usuarios.map(usuario => <tr key={usuario.id}>
                    <td>{usuario.nome}</td><td>{usuario.identificador}</td><td>{usuario.email}</td><td>{usuario.perfil}</td>
                    <td>{usuario.ativo ? "Ativo" : "Inativo"}</td>
                    <td><NavLink to={`/editarUsuario/${usuario.id}`}>Editar</NavLink>{" | "}
                        <button type="button" disabled={processando !== null} onClick={() => void alterarStatus(usuario)}>
                            {processando === usuario.id ? "Atualizando..." : usuario.ativo ? "Desativar" : "Ativar"}
                        </button></td>
                </tr>)}
            </tbody>
        </table>
    </main>;
}
