import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router";
import type { Usuario } from "../../../../types/usuario";
import { isPerfilUsuario, PERFIL_LABEL_PLURAL, PERFIL_LABEL_SINGULAR } from "../../../../utils/perfilUsuario";
import { usuarioService } from "../../../../services/usuarioService";

export default function ListarUsuariosPage() {

    const { perfil } = useParams();
    const titulo = perfil && isPerfilUsuario(perfil) ? PERFIL_LABEL_PLURAL[perfil] : "Usuários";
    const perfilFormat = perfil && isPerfilUsuario(perfil) ? PERFIL_LABEL_SINGULAR[perfil] : "Usuário";

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    const navigate = useNavigate();

    useEffect(() => {

        async function carregarUsuarios() {

            if (!perfil || !isPerfilUsuario(perfil)) {
                return;
            }

            const dados = await usuarioService.listarPorPerfil(perfil);

            setUsuarios(dados);
        }

        carregarUsuarios();

    }, [perfil]);

    return (
        <div>
            <h2>Gerenciar {titulo}</h2>
            <nav className="usuarios-tabs">
                <NavLink to="/gerenciarUsuarios/ALUNO">
                    Alunos
                </NavLink>

                <NavLink to="/gerenciarUsuarios/PROFESSOR">
                    Professores
                </NavLink>

                <NavLink to="/gerenciarUsuarios/SECRETARIA">
                    Secretaria
                </NavLink>
            </nav>

            <NavLink to={`/cadastrarUsuario/${perfil}` }>
                Cadastrar {perfilFormat}
            </NavLink>

            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Identificador</th>
                        <th>Email</th>
                        <th>Perfil</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                            <td>{usuario.nome}</td>
                            <td>{usuario.identificador}</td>
                            <td>{usuario.email}</td>
                            <td>{usuario.perfil}</td>
                            <td>{usuario.ativo ? 'Ativo' : 'Inativo'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}