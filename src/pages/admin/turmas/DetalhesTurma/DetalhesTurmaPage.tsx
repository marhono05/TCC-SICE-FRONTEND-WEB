import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { buscarTurmaPorId } from "../../../../services/turmaService";
import {
    alterarStatusMatriculaAluno,
    listarMatriculasTurma,
} from "../../../../services/matriculaService";
import type { Turma } from "../../../../types/turmas";
import type { MatriculaDaTurma } from "../../../../types/matricula";
import { mensagemErroApi } from "../../../../utils/erroApi";

const etapas: Record<string, string> = {
    PRIMEIRA: "1ª etapa", SEGUNDA: "2ª etapa", TERCEIRA: "3ª etapa",
};
const modalidades: Record<string, string> = {
    MEDIO: "Ensino Médio", TECNICO: "Ensino Técnico",
};

export default function DetalhesTurmaPage() {
    const { id } = useParams();
    const turmaId = Number(id);
    const idValido = Number.isSafeInteger(turmaId) && turmaId > 0;

    const [turma, setTurma] = useState<Turma | null>(null);
    const [matriculas, setMatriculas] = useState<MatriculaDaTurma[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [processandoId, setProcessandoId] = useState<number | null>(null);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!idValido) return;
        let ativo = true;
        // Busca em paralelo apenas dados permitidos ao ADMIN.
        Promise.all([buscarTurmaPorId(turmaId), listarMatriculasTurma(turmaId)])
            .then(([dadosTurma, dadosMatriculas]) => {
                if (ativo) {
                    setTurma(dadosTurma);
                    setMatriculas(dadosMatriculas);
                }
            })
            .catch(falha => {
                if (ativo) setErroCarregamento(mensagemErroApi(falha, "Não foi possível carregar a turma e suas matrículas."));
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, [idValido, turmaId, tentativa]);

    const totalAtivas = useMemo(() => matriculas.filter(m => m.ativo).length, [matriculas]);
    const atualizar = useCallback(async () => {
        // Usa a listagem da própria turma para manter tabela e contadores sincronizados.
        setMatriculas(await listarMatriculasTurma(turmaId));
    }, [turmaId]);

    async function alterarStatus(matricula: MatriculaDaTurma) {
        if (processandoId !== null) return;
        const novoStatus = !matricula.ativo;
        if (!window.confirm(`Deseja ${novoStatus ? "ativar" : "desativar"} a matrícula de ${matricula.nome} nesta turma?`)) return;
        setErroAcao("");
        setSucesso("");
        setProcessandoId(matricula.id);
        try {
            // Reutiliza o endpoint que já valida a titularidade da matrícula.
            await alterarStatusMatriculaAluno(matricula.usuarioId, matricula.id, novoStatus);
            await atualizar();
            setSucesso(`Matrícula de ${matricula.nome} ${novoStatus ? "ativada" : "desativada"} com sucesso.`);
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status da matrícula."));
        } finally {
            setProcessandoId(null);
        }
    }

    return <main>
        <h1>Ver turma</h1>
        <p><Link to="/gerenciarTurmas">Voltar à listagem de turmas</Link></p>
        {!idValido && <p role="alert">Identificador da turma inválido.</p>}
        {idValido && carregando && <p role="status">Carregando dados da turma...</p>}
        {idValido && !carregando && erroCarregamento && <div role="alert">
            <p>{erroCarregamento}</p>
            <button type="button" onClick={() => { setCarregando(true); setErroCarregamento(""); setTentativa(valor => valor + 1); }}>Tentar novamente</button>
        </div>}
        {idValido && !carregando && !erroCarregamento && turma && <>
            <section aria-labelledby="dados-turma">
                <h2 id="dados-turma">Informações gerais</h2>
                <p><strong>ID:</strong> {turma.id}</p>
                <p><strong>Curso:</strong> {turma.cursoNome}</p>
                <p><strong>Ano letivo:</strong> {turma.anoLetivo}</p>
                <p><strong>Etapa:</strong> {etapas[turma.etapa] ?? turma.etapa}</p>
                <p><strong>Modalidade:</strong> {modalidades[turma.modalidade] ?? turma.modalidade}</p>
                <p><strong>Status da turma:</strong> {turma.ativo ? "Ativa" : "Inativa"}</p>
                <p><strong>Status do curso:</strong> {turma.cursoAtivo ? "Ativo" : "Inativo"}</p>
                <p><Link to={`/editarTurmas/${turma.id}`}>Editar dados da turma</Link></p>
            </section>
            <section aria-labelledby="alunos-turma">
                <h2 id="alunos-turma">Alunos matriculados</h2>
                <p>{totalAtivas} matrícula(s) ativa(s) · {matriculas.length} no histórico</p>
                <p>Inclui matrículas ativas e inativas. Desativar uma matrícula não apaga o histórico do aluno.</p>
                {sucesso && <p role="status">{sucesso}</p>}
                {erroAcao && <p role="alert">{erroAcao}</p>}
                <table>
                    <thead><tr>
                        <th scope="col">Aluno</th>
                        <th scope="col">Identificador</th>
                        <th scope="col">E-mail</th>
                        <th scope="col">Usuário</th>
                        <th scope="col">Matrícula</th>
                        <th scope="col">Ações</th>
                    </tr></thead>
                    <tbody>
                        {matriculas.length === 0
                            ? <tr><td colSpan={6}>Esta turma ainda não possui matrículas no histórico.</td></tr>
                            : matriculas.map(matricula => <tr key={matricula.id}>
                                <td>{matricula.nome}</td>
                                <td>{matricula.identificador}</td>
                                <td>{matricula.email || "—"}</td>
                                <td>{matricula.usuarioAtivo ? "Ativo" : "Inativo"}</td>
                                <td>{matricula.ativo ? "Ativa" : "Inativa"}</td>
                                <td>
                                    <Link to={`/alunos/${matricula.usuarioId}`}>Ver aluno</Link>{" | "}
                                    <button type="button"
                                        disabled={processandoId !== null || (!matricula.ativo && (!turma.ativo || !turma.cursoAtivo))}
                                        title={!matricula.ativo && (!turma.ativo || !turma.cursoAtivo) ? "Ative a turma e o curso antes de reativar a matrícula." : undefined}
                                        onClick={() => void alterarStatus(matricula)}>
                                        {processandoId === matricula.id ? "Atualizando..." : matricula.ativo ? "Desativar" : "Ativar"}
                                    </button>
                                </td>
                            </tr>)}
                    </tbody>
                </table>
                {matriculas.length > 0 && totalAtivas === 0 && <p>Nenhum aluno possui matrícula ativa nesta turma no momento.</p>}
            </section>
        </>}
    </main>;
}
