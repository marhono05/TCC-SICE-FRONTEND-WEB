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
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import SecaoFormulario from "../../../../components/ui/SecaoFormulario";
import DadoDetalhe from "../../../../components/ui/DadoDetalhe";
import Botao from "../../../../components/ui/Botao";
import Aviso from "../../../../components/ui/Aviso";
import EtiquetaStatus from "../../../../components/ui/EtiquetaStatus";
import "../../../../components/ui/detalhes-ui.css";


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

    return (
        <main className="sice-detalhes">
            <CabecalhoListagem
                titulo="Detalhes do aluno"
                descricao="Informações do aluno e histórico de matrículas."
                icone="bi-person-vcard"
                acao={<Link className="sice-detalhes__voltar" to="/gerenciarUsuarios/ALUNO"><i className="bi bi-arrow-left" aria-hidden="true" /> Voltar aos alunos</Link>}
            />
            {!idValido && <Aviso variante="erro" role="alert">Identificador do aluno inválido.</Aviso>}
            {idValido && carregando && <p className="sice-detalhes__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" /> Carregando informações do aluno...</p>}
            {idValido && !carregando && erroCarregamento && (
                <Aviso variante="erro" role="alert" titulo="Erro ao carregar aluno">
                    <p>{erroCarregamento}</p>
                    <div className="sice-detalhes__aviso-acoes"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => { setCarregando(true); setErroCarregamento(""); setTentativa(n => n + 1); }}>Tentar novamente</Botao></div>
                </Aviso>
            )}
            {idValido && !carregando && !erroCarregamento && !aluno && <Aviso variante="informacao">Aluno não encontrado.</Aviso>}
            {idValido && !carregando && !erroCarregamento && aluno && (
                <div className="sice-detalhes__corpo">
                    <SecaoFormulario id="dados-aluno" titulo="Informações gerais" descricao="Dados cadastrais do aluno." icone="bi-person-lines-fill">
                        <div className="sice-detalhes__destaque">
                            <div className="sice-detalhes__destaque-texto"><h3>{aluno.nome}</h3><p>Usuário #{aluno.id}</p></div>
                            <EtiquetaStatus ativo={aluno.ativo} />
                        </div>
                        <dl className="sice-detalhes__dados">
                            <DadoDetalhe rotulo="E-mail">{aluno.email || "—"}</DadoDetalhe>
                            <DadoDetalhe rotulo="Identificador">{aluno.identificador}</DadoDetalhe>
                        </dl>
                        <div className="sice-detalhes__acoes sice-detalhes__acoes--separadas">
                            <Link className="sice-detalhes__link" to={`/editarUsuario/${aluno.id}`}><i className="bi bi-pencil-square" aria-hidden="true" /> Editar dados do aluno</Link>
                        </div>
                    </SecaoFormulario>
                    <SecaoFormulario id="matriculas-aluno" titulo="Matrículas do aluno" descricao="As matrículas inativas permanecem no histórico." icone="bi-journal-bookmark">
                        <div className="sice-detalhes__resumo">
                            <span><strong>{totalAtivas}</strong> ativa(s)</span>
                            <span><strong>{matriculas.length}</strong> no histórico</span>
                        </div>
                        {sucesso && <Aviso variante="sucesso" role="status">{sucesso}</Aviso>}
                        {erroAcao && <Aviso variante="erro" role="alert">{erroAcao}</Aviso>}
                        {matriculas.length === 0 ? (
                            <div className="sice-detalhes__vazio"><i className="bi bi-inbox" aria-hidden="true" /><p>Nenhuma matrícula encontrada.</p></div>
                        ) : (
                            <>
                                <div className="sice-detalhes__tabela-container">
                                    <table className="sice-detalhes__tabela">
                                        <thead><tr><th scope="col">Turma / curso</th><th scope="col">Ano</th><th scope="col">Etapa</th><th scope="col">Modalidade</th><th scope="col">Matrícula</th><th scope="col">Turma</th><th scope="col">Ação</th></tr></thead>
                                        <tbody>{matriculas.map(matricula => (
                                            <tr key={matricula.id}>
                                                <td className="sice-detalhes__coluna-principal">{matricula.cursoNome}</td>
                                                <td>{matricula.anoLetivo}</td>
                                                <td>{etapas[matricula.etapa] ?? matricula.etapa}</td>
                                                <td>{modalidades[matricula.modalidade] ?? matricula.modalidade}</td>
                                                <td><EtiquetaStatus ativo={matricula.ativo} rotuloAtivo="Ativa" rotuloInativo="Inativa" /></td>
                                                <td><EtiquetaStatus ativo={matricula.turmaAtiva && matricula.cursoAtivo} rotuloAtivo="Disponível" rotuloInativo="Turma/curso inativo" /></td>
                                                <td><Botao type="button" className="sice-detalhes__botao-pequeno" variante={matricula.ativo ? "perigo" : "secundario"} icone={matricula.ativo ? "bi-slash-circle" : "bi-check-circle"}
                                                    disabled={processando !== null || (!matricula.ativo && (!matricula.turmaAtiva || !matricula.cursoAtivo))}
                                                    title={!matricula.ativo && (!matricula.turmaAtiva || !matricula.cursoAtivo) ? "Ative a turma e o curso antes de reativar a matrícula." : undefined}
                                                    onClick={() => void mudarStatus(matricula)}>
                                                    {processando === String(matricula.id) ? "Atualizando..." : matricula.ativo ? "Desativar" : "Ativar"}
                                                </Botao></td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                                <div className="sice-detalhes__cartoes">
                                    {matriculas.map(matricula => (
                                        <article className="sice-detalhes__cartao" key={matricula.id}>
                                            <div className="sice-detalhes__cartao-topo"><h3>{matricula.cursoNome}</h3><EtiquetaStatus ativo={matricula.ativo} rotuloAtivo="Ativa" rotuloInativo="Inativa" /></div>
                                            <dl className="sice-detalhes__dados">
                                                <DadoDetalhe rotulo="Ano">{matricula.anoLetivo}</DadoDetalhe>
                                                <DadoDetalhe rotulo="Etapa">{etapas[matricula.etapa] ?? matricula.etapa}</DadoDetalhe>
                                                <DadoDetalhe rotulo="Modalidade">{modalidades[matricula.modalidade] ?? matricula.modalidade}</DadoDetalhe>
                                                <DadoDetalhe rotulo="Situação da turma"><EtiquetaStatus ativo={matricula.turmaAtiva && matricula.cursoAtivo} rotuloAtivo="Disponível" rotuloInativo="Turma/curso inativo" /></DadoDetalhe>
                                            </dl>
                                            <Botao type="button" className="sice-detalhes__acao-cartao" variante={matricula.ativo ? "perigo" : "secundario"} icone={matricula.ativo ? "bi-slash-circle" : "bi-check-circle"}
                                                disabled={processando !== null || (!matricula.ativo && (!matricula.turmaAtiva || !matricula.cursoAtivo))}
                                                title={!matricula.ativo && (!matricula.turmaAtiva || !matricula.cursoAtivo) ? "Ative a turma e o curso antes de reativar a matrícula." : undefined}
                                                onClick={() => void mudarStatus(matricula)}>
                                                {processando === String(matricula.id) ? "Atualizando..." : matricula.ativo ? "Desativar matrícula" : "Ativar matrícula"}
                                            </Botao>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                        {totalAtivas === 0 && <Aviso variante="informacao">Este aluno não possui matrículas ativas no momento. As matrículas anteriores continuam no histórico.</Aviso>}
                    </SecaoFormulario>
                    <SecaoFormulario id="nova-matricula" titulo="Adicionar matrícula" descricao="Vincule o aluno a uma nova turma ativa." icone="bi-person-plus">
                        <Aviso variante="informacao">Para uma matrícula anterior, utilize o botão <strong>Ativar</strong> na tabela ou no cartão. O histórico não é apagado.</Aviso>
                        {erroTurmas && <Aviso variante="erro" role="alert">{erroTurmas}<div className="sice-detalhes__aviso-acoes"><Botao type="button" variante="secundario" onClick={() => { setErroTurmas(""); setTentativa(n => n + 1); }}>Tentar novamente</Botao></div></Aviso>}
                        {!erroTurmas && turmasDisponiveis.length === 0 && <Aviso variante="informacao">Não há turmas ativas disponíveis para uma nova matrícula.</Aviso>}
                        {!erroTurmas && turmasDisponiveis.length > 0 && (
                            <form className="sice-detalhes__formulario" onSubmit={event => { event.preventDefault(); void adicionar(); }}>
                                <div className="sice-campo">
                                    <label className="sice-campo__rotulo" htmlFor="turma-nova-matricula">Turma</label>
                                    <select className="sice-campo__controle" id="turma-nova-matricula" value={turmaSelecionada} onChange={event => setTurmaSelecionada(event.target.value)} required disabled={processando !== null}>
                                        <option value="">Selecione uma turma</option>
                                        {turmasDisponiveis.map(turma => <option key={turma.id} value={turma.id}>{descricaoTurma(turma)}</option>)}
                                    </select>
                                </div>
                                <Botao type="submit" icone="bi-plus-circle" disabled={!turmaSelecionada || processando !== null}>
                                    {processando === "adicionar" ? "Adicionando..." : "Adicionar matrícula"}
                                </Botao>
                            </form>
                        )}
                    </SecaoFormulario>
                </div>
            )}
        </main>
    );
}
