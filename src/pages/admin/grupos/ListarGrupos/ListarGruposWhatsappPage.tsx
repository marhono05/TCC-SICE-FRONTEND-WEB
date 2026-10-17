import { useCallback, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router";
import Aviso from "../../../../components/ui/Aviso";
import Botao from "../../../../components/ui/Botao";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import CampoPesquisa from "../../../../components/ui/CampoPesquisa";
import EtiquetaStatus from "../../../../components/ui/EtiquetaStatus";
import { useListagemAdmin } from "../../../../hooks/useListagemAdmin";
import { alterarStatusGrupo, listarTodos } from "../../../../services/grupoWhatsappService";
import type { GrupoWhatsapp } from "../../../../types/grupoWhatsapp";
import { mensagemErroApi } from "../../../../utils/erroApi";
import { normalizarPesquisaListagem } from "../../../../utils/pesquisaListagem";
import "../../../../components/ui/listagem-ui.css";
import "../../../../components/ui/listagem-grupos-eventos.css";

const rotuloTipo: Record<GrupoWhatsapp["tipo"], string> = {
    GERAL_ALUNOS: "Geral dos alunos",
    GERAL_PROFESSORES: "Geral dos professores",
    TURMA: "Turma",
};

const iconeTipo: Record<GrupoWhatsapp["tipo"], string> = {
    GERAL_ALUNOS: "bi-people",
    GERAL_PROFESSORES: "bi-person-workspace",
    TURMA: "bi-mortarboard",
};

type AcoesGrupoProps = {
    grupo: GrupoWhatsapp;
    processando: number | null;
    aoAlterarStatus: (grupo: GrupoWhatsapp) => Promise<void>;
};

/** As mesmas ações aparecem na tabela e nos cartões. */
function AcoesGrupo({ grupo, processando, aoAlterarStatus }: AcoesGrupoProps) {
    return (
        <div className="sice-listagem__acoes">
            <NavLink className="sice-listagem__link-acao" to={`/grupos-whatsapp/editar/${grupo.id}`}>
                <i className="bi bi-pencil-square" aria-hidden="true" />
                Editar
            </NavLink>
            <Botao
                type="button"
                variante={grupo.ativo ? "perigo" : "secundario"}
                icone={grupo.ativo ? "bi-slash-circle" : "bi-check-circle"}
                className="sice-listagem__botao-acao"
                aria-label={`${grupo.ativo ? "Desativar" : "Reativar"} grupo ${grupo.nome}`}
                disabled={processando !== null}
                onClick={() => void aoAlterarStatus(grupo)}
            >
                {processando === grupo.id ? "Atualizando..." : grupo.ativo ? "Desativar" : "Reativar"}
            </Botao>
        </div>
    );
}

function TipoGrupo({ grupo }: { grupo: GrupoWhatsapp }) {
    return (
        <span className="sice-listagem__tipo-grupo">
            <i className={`bi ${iconeTipo[grupo.tipo]}`} aria-hidden="true" />
            {rotuloTipo[grupo.tipo]}
        </span>
    );
}

export default function ListarGruposWhatsappPage() {
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;
    const buscar = useCallback(() => listarTodos(), []);
    const { itens: grupos, carregando, erro, carregar } = useListagemAdmin(buscar);
    const [pesquisa, setPesquisa] = useState("");
    const [processando, setProcessando] = useState<number | null>(null);
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");

    const gruposFiltrados = useMemo(() => {
        const termo = normalizarPesquisaListagem(pesquisa.trim());
        if (!termo) return grupos;
        return grupos.filter((grupo) => normalizarPesquisaListagem([
            grupo.id,
            grupo.nome,
            grupo.identificador,
            rotuloTipo[grupo.tipo],
            grupo.tipo,
            grupo.turmaDescricao ?? "",
            grupo.ativo ? "ativo" : "inativo",
        ].join(" ")).includes(termo));
    }, [grupos, pesquisa]);

    async function alterarStatus(grupo: GrupoWhatsapp) {
        if (processando !== null) return;
        if (!window.confirm(`Deseja ${grupo.ativo ? "desativar" : "reativar"} o grupo ${grupo.nome}?`)) return;
        setProcessando(grupo.id);
        setErroAcao("");
        setSucesso("");
        try {
            await alterarStatusGrupo(grupo.id, !grupo.ativo);
            await carregar();
            setSucesso("Status do grupo atualizado com sucesso.");
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status do grupo."));
        } finally {
            setProcessando(null);
        }
    }

    const total = grupos.length;
    const exibidos = gruposFiltrados.length;
    const possuiResultados = !carregando && !erro && exibidos > 0;

    return (
        <main className="sice-listagem">
            <CabecalhoListagem
                titulo="Grupos do WhatsApp"
                descricao="Consulte os grupos e as turmas vinculadas às comunicações escolares."
                icone="bi-whatsapp"
                acao={(
                    <NavLink to="/grupos-whatsapp/cadastrar" className="sice-botao sice-botao--primario sice-listagem__nova-acao">
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                        Cadastrar grupo
                    </NavLink>
                )}
            />

            {aviso && <Aviso variante="sucesso" role="status">{aviso}</Aviso>}
            {sucesso && <Aviso variante="sucesso" role="status">{sucesso}</Aviso>}
            {erroAcao && <Aviso variante="erro" role="alert">{erroAcao}</Aviso>}

            <section className="sice-listagem__painel" aria-label="Listagem de grupos de WhatsApp">
                <div className="sice-listagem__ferramentas">
                    <CampoPesquisa
                        valor={pesquisa}
                        aoAlterar={setPesquisa}
                        rotulo="Pesquisar grupos"
                        placeholder="Nome, identificador, tipo, turma ou ID"
                        desabilitado={carregando || !!erro}
                    />
                    <p className="sice-listagem__contador" aria-live="polite" aria-atomic="true">
                        {carregando ? "Carregando grupos..." : erro ? "Não foi possível consultar os grupos." :
                            pesquisa.trim() ? `${exibidos} de ${total} grupo(s)` : `${total} grupo(s) cadastrado(s)`}
                    </p>
                </div>

                {erro ? (
                    <Aviso variante="erro" titulo="Não foi possível carregar os grupos" role="alert">
                        <p>{erro}</p>
                        <Botao type="button" variante="secundario" icone="bi-arrow-clockwise"
                            onClick={() => void carregar()} className="sice-listagem__tentar-novamente">
                            Tentar novamente
                        </Botao>
                    </Aviso>
                ) : carregando ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-hourglass-split" aria-hidden="true" />
                        Carregando grupos...
                    </div>
                ) : exibidos === 0 ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-search" aria-hidden="true" />
                        <strong>{total === 0 ? "Nenhum grupo cadastrado." : "Nenhum grupo encontrado."}</strong>
                        {total > 0 && pesquisa.trim() && <p>Tente outro nome, identificador, tipo ou turma.</p>}
                    </div>
                ) : null}

                {possuiResultados && (
                    <>
                        <div className="sice-listagem__tabela-rolagem" tabIndex={0}
                            role="region" aria-label="Tabela de grupos, com rolagem horizontal se necessário">
                            <table className="sice-listagem__tabela sice-listagem__tabela--grupos">
                                <caption className="sice-visualmente-oculto">Grupos de WhatsApp cadastrados</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Nome</th>
                                        <th scope="col">Identificador</th>
                                        <th scope="col">Tipo</th>
                                        <th scope="col">Turma</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gruposFiltrados.map((grupo) => (
                                        <tr key={grupo.id}>
                                            <td className="sice-listagem__nome">{grupo.nome}</td>
                                            <td className="sice-listagem__identificador">{grupo.identificador}</td>
                                            <td><TipoGrupo grupo={grupo} /></td>
                                            <td>{grupo.turmaDescricao ?? "—"}</td>
                                            <td><EtiquetaStatus ativo={grupo.ativo} /></td>
                                            <td><AcoesGrupo grupo={grupo} processando={processando}
                                                aoAlterarStatus={alterarStatus} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="sice-listagem__cartoes" aria-label="Grupos de WhatsApp cadastrados">
                            {gruposFiltrados.map((grupo) => (
                                <article className="sice-listagem__cartao" key={grupo.id}>
                                    <div className="sice-listagem__cartao-topo">
                                        <h2>{grupo.nome}</h2>
                                        <EtiquetaStatus ativo={grupo.ativo} />
                                    </div>
                                    <dl className="sice-listagem__dados">
                                        <div><dt>Identificador</dt><dd className="sice-listagem__identificador">{grupo.identificador}</dd></div>
                                        <div><dt>Tipo de grupo</dt><dd><TipoGrupo grupo={grupo} /></dd></div>
                                        <div><dt>Turma vinculada</dt><dd>{grupo.turmaDescricao ?? "—"}</dd></div>
                                    </dl>
                                    <AcoesGrupo grupo={grupo} processando={processando}
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
