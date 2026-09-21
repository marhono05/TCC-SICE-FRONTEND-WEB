import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router";

import type { Usuario } from "../../../../types/usuario";

import {
    isPerfilUsuario,
    PERFIL_LABEL_PLURAL,
    PERFIL_LABEL_SINGULAR
} from "../../../../utils/perfilUsuario";

import {
    alterarStatusUsuario,
    listarPorPerfil
} from "../../../../services/usuarioService";


export default function ListarUsuariosPage() {

    const { perfil } = useParams();

    const [usuarios, setUsuarios] =
        useState<Usuario[]>([]);

    const [loading, setLoading] =
        useState(true);


    const perfilValido =
        perfil && isPerfilUsuario(perfil)
            ? perfil
            : null;


    const titulo =
        perfilValido
            ? PERFIL_LABEL_PLURAL[perfilValido]
            : "Usuários";


    const perfilFormat =
        perfilValido
            ? PERFIL_LABEL_SINGULAR[perfilValido]
            : "Usuário";


    useEffect(() => {

        async function carregarUsuarios() {

            if (!perfilValido) {
                setLoading(false);
                return;
            }

            try {

                setLoading(true);

                const dados =
                    await listarPorPerfil(
                        perfilValido
                    );

                setUsuarios(dados);

            } catch (error) {

                console.log(
                    "Erro ao carregar usuários"
                );

                console.log(error);

            } finally {

                setLoading(false);

            }
        }


        carregarUsuarios();

    }, [perfilValido]);


    async function alterarStatus(
        usuario: Usuario
    ) {

        const novoStatus =
            !usuario.ativo;


        try {

            await alterarStatusUsuario(
                usuario.id,
                novoStatus
            );


            setUsuarios((usuariosAtuais) =>
                usuariosAtuais.map((item) =>
                    item.id === usuario.id
                        ? {
                            ...item,
                            ativo: novoStatus
                        }
                        : item
                )
            );

        } catch (error) {

            console.log(
                "Erro ao alterar status do usuário"
            );

            console.log(error);

        }
    }


    if (!perfilValido) {

        return (
            <p>
                Perfil inválido.
            </p>
        );

    }


    return (

        <div>

            <h2>
                Gerenciar {titulo}
            </h2>


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


            <br />


            <NavLink
                to={`/cadastrarUsuario/${perfilValido}`}
            >
                Cadastrar {perfilFormat}
            </NavLink>


            <br />
            <br />


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

                    {loading ? (

                        <tr>
                            <td colSpan={6}>
                                Carregando...
                            </td>
                        </tr>

                    ) : usuarios.length === 0 ? (

                        <tr>
                            <td colSpan={6}>
                                Nenhum usuário encontrado.
                            </td>
                        </tr>

                    ) : (

                        usuarios.map((usuario) => (

                            <tr key={usuario.id}>

                                <td>
                                    {usuario.nome}
                                </td>

                                <td>
                                    {usuario.identificador}
                                </td>

                                <td>
                                    {usuario.email}
                                </td>

                                <td>
                                    {usuario.perfil}
                                </td>

                                <td>
                                    {
                                        usuario.ativo
                                            ? "Ativo"
                                            : "Inativo"
                                    }
                                </td>

                                <td>

                                    <NavLink
                                        to={`/editarUsuario/${usuario.id}`}
                                    >
                                        Editar
                                    </NavLink>

                                    {" | "}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            alterarStatus(
                                                usuario
                                            )
                                        }
                                    >
                                        {
                                            usuario.ativo
                                                ? "Desativar"
                                                : "Ativar"
                                        }
                                    </button>

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>

    );
}