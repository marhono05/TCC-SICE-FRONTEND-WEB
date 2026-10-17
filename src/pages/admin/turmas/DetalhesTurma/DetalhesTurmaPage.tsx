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
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import SecaoFormulario from "../../../../components/ui/SecaoFormulario";
import DadoDetalhe from "../../../../components/ui/DadoDetalhe";
import Botao from "../../../../components/ui/Botao";
import Aviso from "../../../../components/ui/Aviso";
import EtiquetaStatus from "../../../../components/ui/EtiquetaStatus";
import "../../../../components/ui/detalhes-ui.css";


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

    return (
        <main className="sice-detalhes">
            <CabecalhoListagem
                titulo="Detalhes da turma"
                descricao="Dados da turma e matrículas dos alunos vinculados."
                icone="bi-mortarboard"
                acao={<Link className="sice-detalhes__voltar" to="/gerenciarTurmas"><i className="bi bi-arrow-left" aria-hidden="true" /> Voltar às turmas</Link>}
            />
            {!idValido && <Aviso variante="erro" role="alert">Identificador da turma inválido.</Aviso>}
            {idValido && carregando && <p className="sice-detalhes__carregando" role="status"><i className="bi bi-hourglass-split" aria-hidden="true" /> Carregando dados da turma...</p>}
            {idValido && !carregando && erroCarregamento && (
                <Aviso variante="erro" role="alert" titulo="Erro ao carregar turma">
                    <p>{erroCarregamento}</p>
                    <div className="sice-detalhes__aviso-acoes"><Botao type="button" variante="secundario" icone="bi-arrow-clockwise" onClick={() => { setCarregando(true); setErroCarregamento(""); setTentativa(valor => valor + 1); }}>Tentar novamente</Botao></div>
                </Aviso>
            )}
            {idValido && !carregando && !erroCarregamento && !turma && <Aviso variante="informacao">Turma não encontrada.</Aviso>}
            {idValido && !carregando && !erroCarregamento && turma && (
                <div className="sice-detalhes__corpo">
                    <SecaoFormulario id="dados-turma" titulo="Informações gerais" descricao="Curso, modalidade e situação cadastral." icone="bi-building">
                        <div className="sice-detalhes__destaque">
                            <div className="sice-detalhes__destaque-texto"><h3>{turma.cursoNome}</h3><p>Turma #{turma.id}</p></div>
                            <EtiquetaStatus ativo={turma.ativo} rotuloAtivo="Ativa" rotuloInativo="Inativa" />
                        </div>
                        <dl className="sice-detalhes__dados">
                            <DadoDetalhe rotulo="Ano letivo">{turma.anoLetivo}</DadoDetalhe>
                            <DadoDetalhe rotulo="Etapa">{etapas[turma.etapa] ?? turma.etapa}</DadoDetalhe>
                            <DadoDetalhe rotulo="Modalidade">{modalidades[turma.modalidade] ?? turma.modalidade}</DadoDetalhe>
                            <DadoDetalhe rotulo="Situação do curso"><EtiquetaStatus ativo={turma.cursoAtivo} /></DadoDetalhe>
                        </dl>
                        <div className="sice-detalhes__acoes sice-detalhes__acoes--separadas">
                            <Link className="sice-detalhes__link" to={`/editarTurmas/${turma.id}`}><i className="bi bi-pencil-square" aria-hidden="true" /> Editar dados da turma</Link>
                        </div>
                    </SecaoFormulario>
                    <SecaoFormulario id="alunos-turma" titulo="Alunos matriculados" descricao="Inclui matrículas ativas e inativas. Desativar não apaga o histórico." icone="bi-people">
                        <div className="sice-detalhes__resumo"><span><strong>{totalAtivas}</strong> ativa(s)</span><span><strong>{matriculas.length}</strong> no histórico</span></div>
                        {sucesso && <Aviso variante="sucesso" role="status">{sucesso}</Aviso>}
                        {erroAcao && <Aviso variante="erro" role="alert">{erroAcao}</Aviso>}
                        {matriculas.length === 0 ? (
                            <div className="sice-detalhes__vazio"><i className="bi bi-inbox" aria-hidden="true" /><p>Esta turma ainda não possui matrículas no histórico.</p></div>
                        ) : (
                            <>
                                <div className="sice-detalhes__tabela-container">
                                    <table className="sice-detalhes__tabela">
                                        <thead><tr><th scope="col">Aluno</th><th scope="col">Identificador</th><th scope="col">E-mail</th><th scope="col">Usuário</th><th scope="col">Matrícula</th><th scope="col">Ações</th></tr></thead>
                                        <tbody>{matriculas.map(matricula => (
                                            <tr key={matricula.id}>
                                                <td className="sice-detalhes__coluna-principal">{matricula.nome}</td>
                                                <td>{matricula.identificador}</td>
                                                <td className="sice-detalhes__quebra">{matricula.email || "—"}</td>
                                                <td><EtiquetaStatus ativo={matricula.usuarioAtivo} /></td>
                                                <td><EtiquetaStatus ativo={matricula.ativo} rotuloAtivo="Ativa" rotuloInativo="Inativa" /></td>
                                                <td><div className="sice-detalhes__acoes">
                                                    <Link className="sice-detalhes__link sice-detalhes__link--pequeno" to={`/alunos/${matricula.usuarioId}`}><i className="bi bi-eye" aria-hidden="true" /> Ver aluno</Link>
                                                    <Botao type="button" className="sice-detalhes__botao-pequeno" variante={matricula.ativo ? "perigo" : "secundario"} icone={matricula.ativo ? "bi-slash-circle" : "bi-check-circle"}
                                                        disabled={processandoId !== null || (!matricula.ativo && (!turma.ativo || !turma.cursoAtivo))}
                                                        title={!matricula.ativo && (!turma.ativo || !turma.cursoAtivo) ? "Ative a turma e o curso antes de reativar a matrícula." : undefined}
                                                        onClick={() => void alterarStatus(matricula)}>
                                                        {processandoId === matricula.id ? "Atualizando..." : matricula.ativo ? "Desativar" : "Ativar"}
                                                    </Botao>
                                                </div></td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                                <div className="sice-detalhes__cartoes">
                                    {matriculas.map(matricula => (
                                        <article className="sice-detalhes__cartao" key={matricula.id}>
                                            <div className="sice-detalhes__cartao-topo"><h3>{matricula.nome}</h3><EtiquetaStatus ativo={matricula.ativo} rotuloAtivo="Ativa" rotuloInativo="Inativa" /></div>
                                            <dl className="sice-detalhes__dados">
                                                <DadoDetalhe rotulo="Identificador">{matricula.identificador}</DadoDetalhe>
                                                <DadoDetalhe rotulo="E-mail">{matricula.email || "—"}</DadoDetalhe>
                                                <DadoDetalhe rotulo="Situação do usuário"><EtiquetaStatus ativo={matricula.usuarioAtivo} /></DadoDetalhe>
                                            </dl>
                                            <div className="sice-detalhes__acoes sice-detalhes__acoes--cartao">
                                                <Link className="sice-detalhes__link" to={`/alunos/${matricula.usuarioId}`}><i className="bi bi-eye" aria-hidden="true" /> Ver aluno</Link>
                                                <Botao type="button" variante={matricula.ativo ? "perigo" : "secundario"} icone={matricula.ativo ? "bi-slash-circle" : "bi-check-circle"}
                                                    disabled={processandoId !== null || (!matricula.ativo && (!turma.ativo || !turma.cursoAtivo))}
                                                    title={!matricula.ativo && (!turma.ativo || !turma.cursoAtivo) ? "Ative a turma e o curso antes de reativar a matrícula." : undefined}
                                                    onClick={() => void alterarStatus(matricula)}>
                                                    {processandoId === matricula.id ? "Atualizando..." : matricula.ativo ? "Desativar matrícula" : "Ativar matrícula"}
                                                </Botao>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                        {matriculas.length > 0 && totalAtivas === 0 && <Aviso variante="informacao">Nenhum aluno possui matrícula ativa nesta turma no momento.</Aviso>}
                    </SecaoFormulario>
                </div>
            )}
        </main>
    );
}
