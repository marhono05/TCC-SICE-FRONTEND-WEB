import { useCallback, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router";
import Aviso from "../../../../components/ui/Aviso";
import Botao from "../../../../components/ui/Botao";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import CampoPesquisa from "../../../../components/ui/CampoPesquisa";
import EtiquetaStatus from "../../../../components/ui/EtiquetaStatus";
import { useListagemAdmin } from "../../../../hooks/useListagemAdmin";
import { alterarStatusTurma, listarTurma } from "../../../../services/turmaService";
import type { Turma } from "../../../../types/turmas";
import { mensagemErroApi } from "../../../../utils/erroApi";
import "../../../../components/ui/listagem-ui.css";
import { normalizarPesquisaListagem } from "../../../../utils/pesquisaListagem";

const ETAPA_ROTULOS: Record<Turma["etapa"], string> = {
    PRIMEIRA: "Primeira",
    SEGUNDA: "Segunda",
    TERCEIRA: "Terceira",
};

const MODALIDADE_ROTULOS: Record<Turma["modalidade"], string> = {
    MEDIO: "Médio",
    TECNICO: "Técnico",
};

type AcoesTurmaProps = {
    turma: Turma;
    processando: number | null;
    aoAlterarStatus: (turma: Turma) => Promise<void>;
};

/** Mantém as três ações originais idênticas em desktop e mobile. */
function AcoesTurma({ turma, processando, aoAlterarStatus }: AcoesTurmaProps) {
    return (
        <div className="sice-listagem__acoes">
            <NavLink className="sice-listagem__link-acao" to={`/turmas/${turma.id}`}>
                <i className="bi bi-eye" aria-hidden="true" />
                Ver turma
            </NavLink>
            <NavLink className="sice-listagem__link-acao" to={`/editarTurmas/${turma.id}`}>
                <i className="bi bi-pencil-square" aria-hidden="true" />
                Editar
            </NavLink>
            <Botao
                type="button"
                variante={turma.ativo ? "perigo" : "secundario"}
                icone={turma.ativo ? "bi-slash-circle" : "bi-check-circle"}
                className="sice-listagem__botao-acao"
                aria-label={`${turma.ativo ? "Desativar" : "Reativar"} turma ${turma.id}`}
                disabled={processando !== null}
                onClick={() => void aoAlterarStatus(turma)}
            >
                {processando === turma.id ? "Atualizando..." : turma.ativo ? "Desativar" : "Reativar"}
            </Botao>
        </div>
    );
}

function NomeCursoTurma({ turma }: { turma: Turma }) {
    return (
        <span>
            {turma.cursoNome}
            {!turma.cursoAtivo && <span className="sice-listagem__observacao">Curso inativo</span>}
        </span>
    );
}

export default function ListarTurmasPage() {
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;
    const buscar = useCallback(() => listarTurma(), []);
    const { itens: turmas, carregando, erro, carregar } = useListagemAdmin(buscar);
    const [pesquisa, setPesquisa] = useState("");
    const [processando, setProcessando] = useState<number | null>(null);
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");

    const turmasFiltradas = useMemo(() => {
        const termo = normalizarPesquisaListagem(pesquisa.trim());
        if (!termo) return turmas;
        return turmas.filter((turma) => normalizarPesquisaListagem([
            turma.id,
            turma.anoLetivo,
            turma.cursoNome,
            turma.modalidade,
            MODALIDADE_ROTULOS[turma.modalidade],
            turma.etapa,
            ETAPA_ROTULOS[turma.etapa],
        ].join(" ")).includes(termo));
    }, [turmas, pesquisa]);

    async function alterarStatus(turma: Turma) {
        if (processando !== null) return;
        if (!window.confirm(`Deseja ${turma.ativo ? "desativar" : "reativar"} esta turma?`)) return;
        setProcessando(turma.id);
        setErroAcao("");
        setSucesso("");
        try {
            await alterarStatusTurma(turma.id, !turma.ativo);
            await carregar();
            setSucesso("Status da turma atualizado com sucesso.");
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status da turma."));
        } finally {
            setProcessando(null);
        }
    }

    const total = turmas.length;
    const exibidos = turmasFiltradas.length;
    const possuiResultados = !carregando && !erro && exibidos > 0;

    return (
        <main className="sice-listagem">
            <CabecalhoListagem
                titulo="Gerenciar turmas"
                descricao="Consulte as turmas, seus cursos e suas situações cadastrais."
                icone="bi-mortarboard"
                acao={(
                    <NavLink to="/cadastrarTurmas" className="sice-botao sice-botao--primario sice-listagem__nova-acao">
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                        Cadastrar turma
                    </NavLink>
                )}
            />

            {aviso && <Aviso variante="sucesso" role="status">{aviso}</Aviso>}
            {sucesso && <Aviso variante="sucesso" role="status">{sucesso}</Aviso>}
            {erroAcao && <Aviso variante="erro" role="alert">{erroAcao}</Aviso>}

            <section className="sice-listagem__painel" aria-label="Listagem de turmas">
                <div className="sice-listagem__ferramentas">
                    <CampoPesquisa
                        valor={pesquisa}
                        aoAlterar={setPesquisa}
                        rotulo="Pesquisar turmas"
                        placeholder="Curso, ano, etapa, modalidade ou ID"
                        desabilitado={carregando || !!erro}
                    />
                    <p className="sice-listagem__contador" aria-live="polite" aria-atomic="true">
                        {carregando ? "Carregando turmas..." : erro ? "Não foi possível consultar as turmas." :
                            pesquisa.trim() ? `${exibidos} de ${total} turma(s)` : `${total} turma(s) cadastrada(s)`}
                    </p>
                </div>

                {erro ? (
                    <Aviso variante="erro" titulo="Não foi possível carregar as turmas" role="alert">
                        <p>{erro}</p>
                        <Botao type="button" variante="secundario" icone="bi-arrow-clockwise"
                            onClick={() => void carregar()} className="sice-listagem__tentar-novamente">
                            Tentar novamente
                        </Botao>
                    </Aviso>
                ) : carregando ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-hourglass-split" aria-hidden="true" />
                        Carregando turmas...
                    </div>
                ) : exibidos === 0 ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-search" aria-hidden="true" />
                        <strong>{total === 0 ? "Nenhuma turma cadastrada." : "Nenhuma turma encontrada."}</strong>
                        {total > 0 && pesquisa.trim() && <p>Tente outro curso, ano, etapa, modalidade ou ID.</p>}
                    </div>
                ) : null}

                {possuiResultados && (
                    <>
                        <div className="sice-listagem__tabela-rolagem" tabIndex={0}
                            role="region" aria-label="Tabela de turmas, com rolagem horizontal se necessário">
                            <table className="sice-listagem__tabela sice-listagem__tabela--turmas">
                                <caption className="sice-visualmente-oculto">Turmas cadastradas</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Ano letivo</th>
                                        <th scope="col">Curso</th>
                                        <th scope="col">Modalidade</th>
                                        <th scope="col">Etapa</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {turmasFiltradas.map((turma) => (
                                        <tr key={turma.id}>
                                            <td>{turma.id}</td>
                                            <td>{turma.anoLetivo}</td>
                                            <td className="sice-listagem__nome"><NomeCursoTurma turma={turma} /></td>
                                            <td>{MODALIDADE_ROTULOS[turma.modalidade]}</td>
                                            <td>{ETAPA_ROTULOS[turma.etapa]}</td>
                                            <td><EtiquetaStatus ativo={turma.ativo} rotuloAtivo="Ativa" rotuloInativo="Inativa" /></td>
                                            <td><AcoesTurma turma={turma} processando={processando}
                                                aoAlterarStatus={alterarStatus} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="sice-listagem__cartoes" aria-label="Turmas cadastradas">
                            {turmasFiltradas.map((turma) => (
                                <article className="sice-listagem__cartao" key={turma.id}>
                                    <div className="sice-listagem__cartao-topo">
                                        <h2>{turma.cursoNome} — {turma.anoLetivo}</h2>
                                        <EtiquetaStatus ativo={turma.ativo} rotuloAtivo="Ativa" rotuloInativo="Inativa" />
                                    </div>
                                    <dl className="sice-listagem__dados">
                                        <div><dt>ID da turma</dt><dd>{turma.id}</dd></div>
                                        <div><dt>Curso</dt><dd><NomeCursoTurma turma={turma} /></dd></div>
                                        <div><dt>Ano letivo</dt><dd>{turma.anoLetivo}</dd></div>
                                        <div><dt>Modalidade</dt><dd>{MODALIDADE_ROTULOS[turma.modalidade]}</dd></div>
                                        <div><dt>Etapa</dt><dd>{ETAPA_ROTULOS[turma.etapa]}</dd></div>
                                    </dl>
                                    <AcoesTurma turma={turma} processando={processando}
                                        aoAlterarStatus={alterarStatus} />
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
