import { useCallback, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router";
import Aviso from "../../../../components/ui/Aviso";
import Botao from "../../../../components/ui/Botao";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import CampoPesquisa from "../../../../components/ui/CampoPesquisa";
import EtiquetaStatus from "../../../../components/ui/EtiquetaStatus";
import { useListagemAdmin } from "../../../../hooks/useListagemAdmin";
import { alterarStatusCurso, listarCurso } from "../../../../services/cursoService";
import type { Curso } from "../../../../types/curso";
import { mensagemErroApi } from "../../../../utils/erroApi";
import "../../../../components/ui/listagem-ui.css";
import { normalizarPesquisaListagem } from "../../../../utils/pesquisaListagem";

type AcoesCursoProps = {
    curso: Curso;
    processando: number | null;
    aoAlterarStatus: (curso: Curso) => Promise<void>;
};

/** As ações são compartilhadas pela tabela (desktop) e pelos cartões (mobile). */
function AcoesCurso({ curso, processando, aoAlterarStatus }: AcoesCursoProps) {
    return (
        <div className="sice-listagem__acoes">
            <NavLink className="sice-listagem__link-acao" to={`/editarCursos/${curso.id}`}>
                <i className="bi bi-pencil-square" aria-hidden="true" />
                Editar
            </NavLink>
            <Botao
                type="button"
                variante={curso.ativo ? "perigo" : "secundario"}
                icone={curso.ativo ? "bi-slash-circle" : "bi-check-circle"}
                className="sice-listagem__botao-acao"
                aria-label={`${curso.ativo ? "Desativar" : "Reativar"} ${curso.nome}`}
                disabled={processando !== null}
                onClick={() => void aoAlterarStatus(curso)}
            >
                {processando === curso.id ? "Atualizando..." : curso.ativo ? "Desativar" : "Reativar"}
            </Botao>
        </div>
    );
}

export default function ListarCursosPage() {
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;
    const buscar = useCallback(() => listarCurso(), []);
    const { itens: cursos, carregando, erro, carregar } = useListagemAdmin(buscar);
    const [pesquisa, setPesquisa] = useState("");
    const [processando, setProcessando] = useState<number | null>(null);
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");

    const cursosFiltrados = useMemo(() => {
        const termo = normalizarPesquisaListagem(pesquisa.trim());
        if (!termo) return cursos;
        return cursos.filter((curso) => normalizarPesquisaListagem(
            `${curso.nome} ${curso.id}`,
        ).includes(termo));
    }, [cursos, pesquisa]);

    async function alterarStatus(curso: Curso) {
        if (processando !== null) return;
        if (!window.confirm(`Deseja ${curso.ativo ? "desativar" : "reativar"} o curso ${curso.nome}?`)) return;
        setProcessando(curso.id);
        setErroAcao("");
        setSucesso("");
        try {
            await alterarStatusCurso(curso.id, !curso.ativo);
            await carregar();
            setSucesso("Status do curso atualizado com sucesso.");
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status do curso."));
        } finally {
            setProcessando(null);
        }
    }

    const total = cursos.length;
    const exibidos = cursosFiltrados.length;
    const possuiResultados = !carregando && !erro && exibidos > 0;

    return (
        <main className="sice-listagem">
            <CabecalhoListagem
                titulo="Gerenciar cursos"
                descricao="Consulte, pesquise e mantenha os cursos da instituição."
                icone="bi-book"
                acao={(
                    <NavLink to="/cadastrarCursos" className="sice-botao sice-botao--primario sice-listagem__nova-acao">
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                        Cadastrar curso
                    </NavLink>
                )}
            />

            {aviso && <Aviso variante="sucesso" role="status">{aviso}</Aviso>}
            {sucesso && <Aviso variante="sucesso" role="status">{sucesso}</Aviso>}
            {erroAcao && <Aviso variante="erro" role="alert">{erroAcao}</Aviso>}

            <section className="sice-listagem__painel" aria-label="Listagem de cursos">
                <div className="sice-listagem__ferramentas">
                    <CampoPesquisa
                        valor={pesquisa}
                        aoAlterar={setPesquisa}
                        rotulo="Pesquisar cursos"
                        placeholder="Nome ou ID do curso"
                        desabilitado={carregando || !!erro}
                    />
                    <p className="sice-listagem__contador" aria-live="polite" aria-atomic="true">
                        {carregando ? "Carregando cursos..." : erro ? "Não foi possível consultar os cursos." :
                            pesquisa.trim() ? `${exibidos} de ${total} curso(s)` : `${total} curso(s) cadastrado(s)`}
                    </p>
                </div>

                {erro ? (
                    <Aviso variante="erro" titulo="Não foi possível carregar os cursos" role="alert">
                        <p>{erro}</p>
                        <Botao type="button" variante="secundario" icone="bi-arrow-clockwise"
                            onClick={() => void carregar()} className="sice-listagem__tentar-novamente">
                            Tentar novamente
                        </Botao>
                    </Aviso>
                ) : carregando ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-hourglass-split" aria-hidden="true" />
                        Carregando cursos...
                    </div>
                ) : exibidos === 0 ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-search" aria-hidden="true" />
                        <strong>{total === 0 ? "Nenhum curso cadastrado." : "Nenhum curso encontrado."}</strong>
                        {total > 0 && pesquisa.trim() && <p>Tente outro nome ou ID de curso.</p>}
                    </div>
                ) : null}

                {possuiResultados && (
                    <>
                        <div className="sice-listagem__tabela-rolagem" tabIndex={0}
                            role="region" aria-label="Tabela de cursos, com rolagem horizontal se necessário">
                            <table className="sice-listagem__tabela sice-listagem__tabela--cursos">
                                <caption className="sice-visualmente-oculto">Cursos cadastrados</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Nome</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cursosFiltrados.map((curso) => (
                                        <tr key={curso.id}>
                                            <td>{curso.id}</td>
                                            <td className="sice-listagem__nome">{curso.nome}</td>
                                            <td><EtiquetaStatus ativo={curso.ativo} /></td>
                                            <td><AcoesCurso curso={curso} processando={processando}
                                                aoAlterarStatus={alterarStatus} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="sice-listagem__cartoes" aria-label="Cursos cadastrados">
                            {cursosFiltrados.map((curso) => (
                                <article className="sice-listagem__cartao" key={curso.id}>
                                    <div className="sice-listagem__cartao-topo">
                                        <h2>{curso.nome}</h2>
                                        <EtiquetaStatus ativo={curso.ativo} />
                                    </div>
                                    <dl className="sice-listagem__dados">
                                        <div><dt>ID do curso</dt><dd>{curso.id}</dd></div>
                                    </dl>
                                    <AcoesCurso curso={curso} processando={processando}
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
