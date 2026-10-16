import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { TurmaFormData } from "../../../../schemas/turmaSchemas";
import { listarCurso } from "../../../../services/cursoService";
import { buscarTurmaPorId, editarTurma } from "../../../../services/turmaService";
import type { Curso } from "../../../../types/curso";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";
import FormTurma from "../../../../components/FormTurma/FormTurma";

export default function EditarTurmasPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [turma, setTurma] = useState<Turma | null>(null);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    useEffect(() => {
        async function carregar() {
            if (!id || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
                setErroCarregamento("Identificador da turma inválido."); setCarregando(false); return;
            }
            try {
                const [turmaEncontrada, cursosEncontrados] = await Promise.all([buscarTurmaPorId(Number(id)), listarCurso()]);
                setTurma(turmaEncontrada);
                setCursos(cursosEncontrados.filter(curso => curso.ativo || curso.id === turmaEncontrada.cursoId));
            } catch (falha) { setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar a turma e os cursos.")); }
            finally { setCarregando(false); }
        }
        void carregar();
    }, [id]);
    async function editar(dados: TurmaFormData) {
        if (!turma || salvando) return;
        setErro(""); setSalvando(true);
        try {
            await editarTurma(turma.id, dados);
            navigate("/gerenciarTurmas", { state: { aviso: "Turma atualizada com sucesso." } });
        } catch (falha) { setErro(mensagemErroApi(falha, "Não foi possível editar a turma.")); }
        finally { setSalvando(false); }
    }
    return <main>
        <h1>Editar Turma</h1>
        <p><Link to="/gerenciarTurmas">Voltar à listagem</Link></p>
        {carregando ? <p>Carregando turma...</p> : erroCarregamento ? <p role="alert">{erroCarregamento}</p> : !turma ? <p role="alert">Turma não encontrada.</p> : <>
            {erro && <p role="alert">{erro}</p>}
            <FormTurma turma={turma} cursos={cursos} onSubmit={editar} salvando={salvando} />
        </>}
    </main>;
}
