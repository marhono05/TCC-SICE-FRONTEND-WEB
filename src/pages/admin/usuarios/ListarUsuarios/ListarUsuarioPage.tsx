import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Usuario } from "../../../../types/usuario";
import { isPerfilUsuario } from "../../../../utils/perfilUsuario";
import { usuarioService } from "../../../../services/usuarioService";

export default function ListarUsuariosPage() {

    const { perfil } = useParams();

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

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