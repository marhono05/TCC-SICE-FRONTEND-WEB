import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { UsuarioFormData } from "../../../../schemas/usuarioSchema";
import { buscarUsuarioPorId, editarUsuario } from "../../../../services/usuarioService";
import { listarTurma } from "../../../../services/turmaService";
import type { Usuario } from "../../../../types/usuario";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormUsuario from "../../../../components/FormUsuario/FormUsuario";
import RedefinirSenhaUsuario from "../../../../components/FormRedefinirSenha/RedefinirSenhaUsuario";

import PaginaFormulario from "../../../../components/ui/PaginaFormulario";
import Aviso from "../../../../components/ui/Aviso";

export default function EditarUsuarioPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        async function carregar() {
            if (!id || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
                setErroCarregamento("Identificador do usuário inválido."); setCarregando(false); return;
            }
            try {
                const encontrado: Usuario = await buscarUsuarioPorId(Number(id));
                setUsuario(encontrado);
                if (encontrado.perfil === "ALUNO") {
                    const todas = await listarTurma();
                    setTurmas(todas.filter(turma => turma.ativo || encontrado.turmasIds.includes(turma.id)));
                }
            } catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar o usuário ou suas turmas.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, [id]);
    async function editar(dados: UsuarioFormData) {
        if (!usuario || salvando) return;
        setErro(""); setSalvando(true);
        try {
            await editarUsuario(usuario.id, {
                nome: dados.nome, email: dados.email, identificador: dados.identificador,
                turmasIds: usuario.perfil === "ALUNO" ? dados.turmasIds : []
            });
            navigate(`/gerenciarUsuarios/${usuario.perfil}`, { state: { aviso: "Usuário atualizado com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível editar o usuário.")); }
        finally { setSalvando(false); }
    }
    return (
        <PaginaFormulario
            titulo={"Editar usuário"}
            descricao={"Atualize os dados cadastrais. A redefinição de senha fica em uma seção separada."}
            icone="bi-person-gear"
            voltarPara={`/gerenciarUsuarios/${usuario?.perfil ?? "ALUNO"}`}
            textoVoltar="Voltar para usuários"
            acao={usuario?.perfil === "ALUNO" ? (
                <Link className="sice-pagina-formulario__link-auxiliar" to={`/alunos/${usuario.id}`}>
                    <i className="bi bi-mortarboard" aria-hidden="true" />Ver detalhes e matrículas
                </Link>
            ) : undefined}
        >
            {carregando ? (
                <div className="sice-pagina-formulario__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" />Carregando usuário...</div>
            ) : erroCarregamento ? (
                <Aviso variante="erro" role="alert">{erroCarregamento}</Aviso>
            ) : !usuario ? (
                <Aviso variante="informacao">Usuário não encontrado.</Aviso>
            ) : (
                <>
                    {erro && <Aviso variante="erro" role="alert">{erro}</Aviso>}
                    <FormUsuario usuario={usuario} perfil={usuario.perfil} turmas={turmas} onSubmit={editar} salvando={salvando} />
                    <RedefinirSenhaUsuario usuario={usuario} />
                </>
            )}
        </PaginaFormulario>
    );
}
