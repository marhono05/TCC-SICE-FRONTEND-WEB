import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { buscarUsuarioPorId } from "../../../../services/usuarioService";
import { listarTurma } from "../../../../services/turmaService";
import { listarCurso } from "../../../../services/cursoService";
import type { Turma } from "../../../../types/turmas";
import type { Curso } from "../../../../types/curso";
import type { Usuario } from "../../../../types/usuario";
import { mensagemErroApi } from "../../../../utils/erroApi";
import type { Matricula } from "../../../../types/matricula";
import { listarMatriculasAluno, adicionarMatriculaAluno, alterarStatusMatriculaAluno } from "../../../../services/matriculaService";

const etapas: Record<string, string> = { PRIMEIRA: "1ª etapa", SEGUNDA: "2ª etapa", TERCEIRA: "3ª etapa" };
const modalidades: Record<string, string> = { MEDIO: "Ensino Médio", TECNICO: "Ensino Técnico" };

function descricaoTurma(turma: Pick<Turma, "cursoNome" | "anoLetivo" | "etapa" | "modalidade">) {
    return `${turma.cursoNome} · ${turma.anoLetivo} · ${etapas[turma.etapa] ?? turma.etapa} · ${modalidades[turma.modalidade] ?? turma.modalidade}`;
}

export default function DetalhesAlunoPage() {
    const { id } = useParams();
    const usuarioId = Number(id);
    const idValido = Number.isSafeInteger(usuarioId) && usuarioId > 0;

    const [aluno, setAluno] = useState<Usuario | null>(null);
    const [matriculas, setMatriculas] = useState<Matricula[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erroTurmas, setErroTurmas] = useState("");
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [turmaSelecionada, setTurmaSelecionada] = useState("");
    const [processando, setProcessando] = useState<string | null>(null);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!idValido) return;
        let ativo = true;
        async function carregar() {
            try {
                const [dadosAluno, dadosMatriculas] = await Promise.all([
                    buscarUsuarioPorId(usuarioId), listarMatriculasAluno(usuarioId)
                ]);
                if (dadosAluno.perfil !== "ALUNO") throw new Error("Este usuário não é um aluno.");
                if (ativo) { setAluno(dadosAluno); setMatriculas(dadosMatriculas); }
            } catch (falha) {
                if (ativo) setErroCarregamento(
                    falha instanceof Error && falha.message === "Este usuário não é um aluno."
                        ? falha.message : mensagemErroApi(falha, "Não foi possível carregar os dados do aluno.")
                );
            } finally { if (ativo) setCarregando(false); }
            try {
                const [dadosTurmas, dadosCursos] = await Promise.all([listarTurma(), listarCurso()]);
                if (ativo) { setTurmas(dadosTurmas); setCursos(dadosCursos); setErroTurmas(""); }
            } catch (falha) {
                if (ativo) setErroTurmas(mensagemErroApi(falha, "Não foi possível carregar as turmas disponíveis."));
            }
        }
        void carregar();
        return () => { ativo = false; };
    }, [idValido, usuarioId, tentativa]);

    const totalAtivas = useMemo(() => matriculas.filter(m => m.ativo).length, [matriculas]);
    const turmasDisponiveis = useMemo(() => {
        const idsMatriculados = new Set(matriculas.map(m => m.turmaId));
        const cursosAtivos = new Set(cursos.filter(curso => curso.ativo).map(curso => curso.id));
        return turmas.filter(turma => turma.ativo && cursosAtivos.has(turma.cursoId) && !idsMatriculados.has(turma.id));
    }, [turmas, cursos, matriculas]);

    const atualizarMatriculas = useCallback(async () => {
        setMatriculas(await listarMatriculasAluno(usuarioId));
    }, [usuarioId]);

    async function adicionar() {
        const turmaId = Number(turmaSelecionada);
        if (!Number.isSafeInteger(turmaId) || turmaId < 1 || processando !== null) return;
        setErroAcao(""); setSucesso(""); setProcessando("adicionar");
        try {
            await adicionarMatriculaAluno(usuarioId, turmaId);
            await atualizarMatriculas();
            setTurmaSelecionada("");
            setSucesso("Matrícula adicionada com sucesso.");
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível adicionar a matrícula."));
        } finally { setProcessando(null); }
    }

    async function mudarStatus(matricula: Matricula) {
        if (processando !== null) return;
        const novoStatus = !matricula.ativo;
        if (!window.confirm(`Deseja ${novoStatus ? "ativar" : "desativar"} a matrícula na turma ${descricaoTurma(matricula)}?`)) return;
        setErroAcao(""); setSucesso(""); setProcessando(String(matricula.id));
        try {
            await alterarStatusMatriculaAluno(usuarioId, matricula.id, novoStatus);
            await atualizarMatriculas();
            setSucesso(`Matrícula ${novoStatus ? "ativada" : "desativada"} com sucesso.`);
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar a matrícula."));
        } finally { setProcessando(null); }
    }

    return <main>
        <h1>Detalhes do Aluno</h1>
        <p><Link to="/gerenciarUsuarios/ALUNO">Voltar à listagem de alunos</Link></p>
        {!idValido && <p role="alert">Identificador do aluno inválido.</p>}
        {idValido && carregando && <p role="status">Carregando informações do aluno...</p>}
        {idValido && !carregando && erroCarregamento && <div role="alert">
            <p>{erroCarregamento}</p>
            <button type="button" onClick={() => { setCarregando(true); setErroCarregamento(""); setTentativa(n => n + 1); }}>Tentar novamente</button>
        </div>}
        {idValido && !carregando && !erroCarregamento && aluno && <>
            <section aria-labelledby="dados-aluno">
                <h2 id="dados-aluno">Informações gerais</h2>
                <p><strong>Nome:</strong> {aluno.nome}</p>
                <p><strong>E-mail:</strong> {aluno.email}</p>
                <p><strong>Identificador:</strong> {aluno.identificador}</p>
                <p><strong>Status do usuário:</strong> {aluno.ativo ? "Ativo" : "Inativo"}</p>
                <p><Link to={`/editarUsuario/${aluno.id}`}>Editar dados do aluno</Link></p>
            </section>
            <section aria-labelledby="matriculas-aluno">
                <h2 id="matriculas-aluno">Matrículas do aluno</h2>
                <p>{totalAtivas} matrícula(s) ativa(s) · {matriculas.length} no histórico</p>
                {sucesso && <p role="status">{sucesso}</p>}
                {erroAcao && <p role="alert">{erroAcao}</p>}
                <table>
                    <thead><tr><th scope="col">Turma / curso</th><th scope="col">Ano</th><th scope="col">Etapa</th><th scope="col">Modalidade</th><th scope="col">Matrícula</th><th scope="col">Turma</th><th scope="col">Ação</th></tr></thead>
                    <tbody>
                        {matriculas.length === 0 ? <tr><td colSpan={7}>Nenhuma matrícula encontrada.</td></tr> :
                            matriculas.map(matricula => <tr key={matricula.id}>
                                <td>{matricula.cursoNome}</td>
                                <td>{matricula.anoLetivo}</td>
                                <td>{etapas[matricula.etapa] ?? matricula.etapa}</td>
                                <td>{modalidades[matricula.modalidade] ?? matricula.modalidade}</td>
                                <td>{matricula.ativo ? "Ativa" : "Inativa"}</td>
                                <td>{matricula.turmaAtiva && matricula.cursoAtivo ? "Disponível" : "Turma/curso inativo"}</td>
                                <td>
                                    <button type="button"
                                        disabled={processando !== null || (!matricula.ativo && (!matricula.turmaAtiva || !matricula.cursoAtivo))}
                                        title={!matricula.ativo && (!matricula.turmaAtiva || !matricula.cursoAtivo) ? "Ative a turma e o curso antes de reativar a matrícula." : undefined}
                                        onClick={() => void mudarStatus(matricula)}>
                                        {processando === String(matricula.id) ? "Atualizando..." : matricula.ativo ? "Desativar" : "Ativar"}
                                    </button>
                                </td>
                            </tr>)}
                    </tbody>
                </table>
                {totalAtivas === 0 && <p>Este aluno não possui matrículas ativas no momento. As matrículas anteriores continuam no histórico.</p>}
            </section>
            <section aria-labelledby="nova-matricula">
                <h2 id="nova-matricula">Adicionar matrícula</h2>
                <p>Para uma matrícula anterior, utilize o botão <strong>Ativar</strong> na tabela. O histórico não é apagado.</p>
                {erroTurmas && <p role="alert">{erroTurmas} <button type="button" onClick={() => { setErroTurmas(""); setTentativa(n => n + 1); }}>Tentar novamente</button></p>}
                {!erroTurmas && turmasDisponiveis.length === 0 && <p>Não há turmas ativas disponíveis para uma nova matrícula.</p>}
                {!erroTurmas && turmasDisponiveis.length > 0 && <form onSubmit={event => { event.preventDefault(); void adicionar(); }}>
                    <label htmlFor="turma-nova-matricula">Turma</label>{" "}
                    <select id="turma-nova-matricula" value={turmaSelecionada} onChange={event => setTurmaSelecionada(event.target.value)} required disabled={processando !== null}>
                        <option value="">Selecione uma turma</option>
                        {turmasDisponiveis.map(turma => <option key={turma.id} value={turma.id}>{descricaoTurma(turma)}</option>)}
                    </select>{" "}
                    <button type="submit" disabled={!turmaSelecionada || processando !== null}>{processando === "adicionar" ? "Adicionando..." : "Adicionar matrícula"}</button>
                </form>}
            </section>
        </>}
    </main>;
}
