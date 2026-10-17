import { useCallback, useMemo, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router";
import Aviso from "../../../../components/ui/Aviso";
import Botao from "../../../../components/ui/Botao";
import CabecalhoListagem from "../../../../components/ui/CabecalhoListagem";
import CampoPesquisa from "../../../../components/ui/CampoPesquisa";
import EtiquetaStatus from "../../../../components/ui/EtiquetaStatus";
import { useListagemAdmin } from "../../../../hooks/useListagemAdmin";
import { alterarStatusUsuario, listarPorPerfil } from "../../../../services/usuarioService";
import type { Usuario } from "../../../../types/usuario";
import { mensagemErroApi } from "../../../../utils/erroApi";
import {
    isPerfilUsuario, PERFIL_LABEL_PLURAL, PERFIL_LABEL_SINGULAR,
} from "../../../../utils/perfilUsuario";
import type { PerfilUsuario } from "../../../../schemas/perfilUsuarioSchema";
import { normalizarPesquisaListagem } from "../../../../utils/pesquisaListagem";
import "../../../../components/ui/listagem-ui.css";

type AcoesUsuarioProps = {
    usuario: Usuario;
    processando: number | null;
    aoAlterarStatus: (usuario: Usuario) => Promise<void>;
};

/** As mesmas ações e rotas aparecem na tabela e nos cartões. */
function AcoesUsuario({ usuario, processando, aoAlterarStatus }: AcoesUsuarioProps) {
    return (
        <div className="sice-listagem__acoes">
            {usuario.perfil === "ALUNO" && (
                <NavLink className="sice-listagem__link-acao" to={`/alunos/${usuario.id}`}>
                    <i className="bi bi-person-vcard" aria-hidden="true" />
                    Detalhes / Matrículas
                </NavLink>
            )}
            <NavLink className="sice-listagem__link-acao" to={`/editarUsuario/${usuario.id}`}>
                <i className="bi bi-pencil-square" aria-hidden="true" />
                Editar
            </NavLink>
            <Botao
                type="button"
                variante={usuario.ativo ? "perigo" : "secundario"}
                icone={usuario.ativo ? "bi-person-dash" : "bi-person-check"}
                className="sice-listagem__botao-acao"
                disabled={processando !== null}
                aria-label={`${usuario.ativo ? "Desativar" : "Ativar"} ${usuario.nome}`}
                onClick={() => void aoAlterarStatus(usuario)}
            >
                {processando === usuario.id ? "Atualizando..." : usuario.ativo ? "Desativar" : "Ativar"}
            </Botao>
        </div>
    );
}

function ListagemPorPerfil({ perfil, aviso }: { perfil: PerfilUsuario; aviso?: string }) {
    const [pesquisa, setPesquisa] = useState("");
    const [processando, setProcessando] = useState<number | null>(null);
    const [erroAcao, setErroAcao] = useState("");
    const [sucesso, setSucesso] = useState("");
    const buscar = useCallback(() => listarPorPerfil(perfil), [perfil]);
    const { itens: usuarios, carregando, erro, carregar } = useListagemAdmin(buscar);

    const usuariosFiltrados = useMemo(() => {
        const termo = normalizarPesquisaListagem(pesquisa.trim());
        if (!termo) return usuarios;
        return usuarios.filter((usuario) => normalizarPesquisaListagem(
            `${usuario.nome} ${usuario.identificador} ${usuario.email}`,
        ).includes(termo));
    }, [pesquisa, usuarios]);

    async function alterarStatus(usuario: Usuario) {
        if (processando !== null) return;
        const acao = usuario.ativo ? "desativar" : "ativar";
        if (!window.confirm(`Deseja ${acao} ${usuario.nome}?`)) return;
        setErroAcao("");
        setSucesso("");
        setProcessando(usuario.id);
        try {
            await alterarStatusUsuario(usuario.id, !usuario.ativo);
            await carregar();
            setSucesso(`Usuário ${usuario.ativo ? "desativado" : "ativado"} com sucesso.`);
        } catch (falha) {
            setErroAcao(mensagemErroApi(falha, "Não foi possível alterar o status do usuário."));
        } finally {
            setProcessando(null);
        }
    }

    const total = usuarios.length;
    const exibidos = usuariosFiltrados.length;
    const possuiResultados = !carregando && !erro && exibidos > 0;

    return (
        <main className="sice-listagem">
            <CabecalhoListagem
                titulo={`Gerenciar ${PERFIL_LABEL_PLURAL[perfil]}`}
                descricao="Consulte, pesquise e atualize os usuários cadastrados."
                icone="bi-people"
                acao={(
                    <NavLink className="sice-botao sice-botao--primario sice-listagem__nova-acao"
                        to={`/cadastrarUsuario/${perfil}`}>
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                        Cadastrar {PERFIL_LABEL_SINGULAR[perfil].toLocaleLowerCase("pt-BR")}
                    </NavLink>
                )}
            />

            <nav className="sice-listagem__abas" aria-label="Perfis de usuários">
                <NavLink to="/gerenciarUsuarios/ALUNO" className={({ isActive }) =>
                    `sice-listagem__aba${isActive ? " sice-listagem__aba--ativa" : ""}`}>
                    <i className="bi bi-mortarboard" aria-hidden="true" />Alunos
                </NavLink>
                <NavLink to="/gerenciarUsuarios/PROFESSOR" className={({ isActive }) =>
                    `sice-listagem__aba${isActive ? " sice-listagem__aba--ativa" : ""}`}>
                    <i className="bi bi-person-workspace" aria-hidden="true" />Professores
                </NavLink>
                <NavLink to="/gerenciarUsuarios/SECRETARIA" className={({ isActive }) =>
                    `sice-listagem__aba${isActive ? " sice-listagem__aba--ativa" : ""}`}>
                    <i className="bi bi-person-badge" aria-hidden="true" />Secretaria
                </NavLink>
            </nav>

            {aviso && <Aviso variante="sucesso" role="status">{aviso}</Aviso>}
            {sucesso && <Aviso variante="sucesso" role="status">{sucesso}</Aviso>}
            {erroAcao && <Aviso variante="erro" role="alert">{erroAcao}</Aviso>}

            <section className="sice-listagem__painel" aria-label="Listagem de usuários">
                <div className="sice-listagem__ferramentas">
                    <CampoPesquisa valor={pesquisa} aoAlterar={setPesquisa}
                        rotulo="Pesquisar usuários"
                        placeholder="Nome, identificador ou e-mail"
                        desabilitado={carregando || !!erro}
                    />
                    <p className="sice-listagem__contador" aria-live="polite" aria-atomic="true">
                        {carregando ? "Carregando usuários..." : erro ? "Não foi possível consultar a lista." :
                            pesquisa.trim() ? `${exibidos} de ${total} usuário(s)` : `${total} usuário(s) cadastrado(s)`}
                    </p>
                </div>

                {erro ? (
                    <Aviso variante="erro" titulo="Não foi possível carregar os usuários" role="alert">
                        <p>{erro}</p>
                        <Botao variante="secundario" type="button" icone="bi-arrow-clockwise"
                            onClick={() => void carregar()} className="sice-listagem__tentar-novamente">
                            Tentar novamente
                        </Botao>
                    </Aviso>
                ) : carregando ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-hourglass-split" aria-hidden="true" />
                        Carregando usuários...
                    </div>
                ) : exibidos === 0 ? (
                    <div className="sice-listagem__estado" role="status">
                        <i className="bi bi-search" aria-hidden="true" />
                        <strong>{total === 0 ? "Nenhum usuário cadastrado neste perfil." : "Nenhum usuário encontrado."}</strong>
                        {total > 0 && pesquisa.trim() && <p>Tente outro nome, identificador ou e-mail.</p>}
                    </div>
                ) : null}

                {possuiResultados && (
                    <>
                        <div className="sice-listagem__tabela-rolagem" tabIndex={0}
                            role="region" aria-label="Tabela de usuários, com rolagem horizontal se necessário">
                            <table className="sice-listagem__tabela">
                                <caption className="sice-visualmente-oculto">{PERFIL_LABEL_PLURAL[perfil]} cadastrados</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Nome</th>
                                        <th scope="col">Identificador</th>
                                        <th scope="col">E-mail</th>
                                        <th scope="col">Perfil</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosFiltrados.map((usuario) => (
                                        <tr key={usuario.id}>
                                            <td className="sice-listagem__nome">{usuario.nome}</td>
                                            <td>{usuario.identificador}</td>
                                            <td className="sice-listagem__email">{usuario.email}</td>
                                            <td>{PERFIL_LABEL_SINGULAR[usuario.perfil]}</td>
                                            <td><EtiquetaStatus ativo={usuario.ativo} /></td>
                                            <td><AcoesUsuario usuario={usuario} processando={processando}
                                                aoAlterarStatus={alterarStatus} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="sice-listagem__cartoes" aria-label="Usuários cadastrados">
                            {usuariosFiltrados.map((usuario) => (
                                <article className="sice-listagem__cartao" key={usuario.id}>
                                    <div className="sice-listagem__cartao-topo">
                                        <h2>{usuario.nome}</h2>
                                        <EtiquetaStatus ativo={usuario.ativo} />
                                    </div>
                                    <dl className="sice-listagem__dados">
                                        <div><dt>Identificador</dt><dd>{usuario.identificador}</dd></div>
                                        <div><dt>E-mail</dt><dd>{usuario.email}</dd></div>
                                        <div><dt>Perfil</dt><dd>{PERFIL_LABEL_SINGULAR[usuario.perfil]}</dd></div>
                                    </dl>
                                    <AcoesUsuario usuario={usuario} processando={processando}
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

export default function ListarUsuariosPage() {
    const { perfil } = useParams();
    const perfilValido = perfil && isPerfilUsuario(perfil) ? perfil : null;
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;

    if (!perfilValido) return <p role="alert">Perfil inválido.</p>;

    // A chave reinicializa a pesquisa e a listagem ao mudar de perfil,
    // evitando exibir rapidamente registros do perfil anterior.
    return <ListagemPorPerfil key={perfilValido} perfil={perfilValido} aviso={aviso} />;
}
