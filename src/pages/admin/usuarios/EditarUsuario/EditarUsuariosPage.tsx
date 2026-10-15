import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import FormUsuario from "../../../../components/FormUsuario";
import type { UsuarioFormData } from "../../../../schemas/usuarioSchema";
import { buscarUsuarioPorId, editarUsuario } from "../../../../services/usuarioService";
import { listarTurma } from "../../../../services/turmaService";
import type { Usuario } from "../../../../types/usuario";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";

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
    return <main>
        <h1>Editar Usuário</h1>
        <p><Link to={`/gerenciarUsuarios/${usuario?.perfil ?? "ALUNO"}`}>Voltar à listagem</Link></p>
        {carregando ? <p>Carregando usuário...</p> : erroCarregamento ? <p role="alert">{erroCarregamento}</p> : !usuario ? <p role="alert">Usuário não encontrado.</p> : <>
            {erro && <p role="alert">{erro}</p>}
            <FormUsuario usuario={usuario} perfil={usuario.perfil} turmas={turmas} onSubmit={editar} salvando={salvando} />
        </>}
    </main>;
}
