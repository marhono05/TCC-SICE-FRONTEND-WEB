import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import FormUsuario from "../../../../components/FormUsuario";
import type { UsuarioFormData } from "../../../../schemas/usuarioSchema";
import { cadastrarUsuario } from "../../../../services/usuarioService";
import { listarTurma } from "../../../../services/turmaService";
import type { Turma } from "../../../../types/turmas";
import { isPerfilUsuario, PERFIL_LABEL_SINGULAR } from "../../../../utils/perfilUsuario";
import { mensagemErroApi } from "../../../../utils/erroApi";

export default function CadastrarUsuarioPage() {
    const { perfil } = useParams();
    const perfilValido = perfil && isPerfilUsuario(perfil) ? perfil : null;
    const navigate = useNavigate();
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregando, setCarregando] = useState(perfilValido === "ALUNO");
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        if (perfilValido !== "ALUNO") return;
        async function carregar() {
            setCarregando(true); setErroCarregamento("");
            try { setTurmas((await listarTurma()).filter(turma => turma.ativo)); }
            catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar as turmas.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, [perfilValido]);
    async function cadastrar(dados: UsuarioFormData) {
        if (!perfilValido || salvando) return;
        setErro(""); setSalvando(true);
        try {
            await cadastrarUsuario({ ...dados, perfil: perfilValido, turmasIds: perfilValido === "ALUNO" ? dados.turmasIds : [] });
            navigate(`/gerenciarUsuarios/${perfilValido}`, { state: { aviso: "Usuário cadastrado com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível cadastrar o usuário.")); }
        finally { setSalvando(false); }
    }
    if (!perfilValido) return <p role="alert">Perfil de usuário inválido.</p>;
    return <main>
        <h1>Cadastrar {PERFIL_LABEL_SINGULAR[perfilValido]}</h1>
        <p><Link to={`/gerenciarUsuarios/${perfilValido}`}>Voltar à listagem</Link></p>
        {carregando ? <p>Carregando turmas...</p> : erroCarregamento ? <p role="alert">{erroCarregamento}</p> : perfilValido === "ALUNO" && turmas.length === 0 ? <p role="alert">Cadastre ou ative uma turma antes de cadastrar alunos.</p> : <>
            {erro && <p role="alert">{erro}</p>}
            <FormUsuario perfil={perfilValido} turmas={turmas} onSubmit={cadastrar} salvando={salvando} />
        </>}
    </main>;
}
