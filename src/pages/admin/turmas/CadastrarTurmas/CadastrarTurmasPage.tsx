import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { TurmaFormData } from "../../../../schemas/turmaSchemas";
import { listarCurso } from "../../../../services/cursoService";
import { cadastrarTurma } from "../../../../services/turmaService";
import type { Curso } from "../../../../types/curso";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormTurma from "../../../../components/FormTurma/FormTurma";

export default function CadastrarTurmasPage() {
    const navigate = useNavigate();
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        async function carregar() {
            try { setCursos((await listarCurso()).filter(curso => curso.ativo)); }
            catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar os cursos.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, []);
    async function cadastrar(dados: TurmaFormData) {
        if (salvando) return;
        setErro(""); setSalvando(true);
        try {
            await cadastrarTurma(dados);
            navigate("/gerenciarTurmas", { state: { aviso: "Turma cadastrada com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível cadastrar a turma.")); }
        finally { setSalvando(false); }
    }
    return <main>
        <h1>Cadastrar Turma</h1>
        <p><Link to="/gerenciarTurmas">Voltar à listagem</Link></p>
        {carregando ? <p>Carregando cursos...</p> : erroCarregamento ? <p role="alert">{erroCarregamento}</p> : cursos.length === 0 ? <p role="alert">Cadastre ou ative um curso antes de cadastrar turmas.</p> : <>
            {erro && <p role="alert">{erro}</p>}
            <FormTurma cursos={cursos} onSubmit={cadastrar} salvando={salvando} />
        </>}
    </main>;
}
