import { NavLink, useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import logoSice from "../../assets/images/logo/logo.svg";
import type { PerfilUsuario } from "../../schemas/perfilUsuarioSchema";
import "./Sidebar.css";

type SidebarProps = {
  nome: string;
  perfil: PerfilUsuario;
  aberta: boolean;
  onFechar: () => void;
  onSair: () => void;
  saindo: boolean;
  erroSaida: string;
  fecharRef: RefObject<HTMLButtonElement | null>;
};

type ItemNavegacao = {
  caminho: string;
  rotulo: string;
  icone: string;
  caminhosRelacionados?: string[];
};

const itensGerais: ItemNavegacao[] = [
  { caminho: "/dashboard", rotulo: "Painel", icone: "speedometer2" },
  { caminho: "/eventos", rotulo: "Calendário", icone: "calendar3" },
];

const itensSecretaria: ItemNavegacao[] = [
  {
    caminho: "/gerenciarEventos", rotulo: "Gerenciar eventos", icone: "calendar-check",
    caminhosRelacionados: ["/cadastrarEventos", "/editarEventos", "/eventos/"],
  },
  {
    caminho: "/avisos", rotulo: "Central de avisos", icone: "bell",
  },
  {
    caminho: "/gerenciarGruposWhatsapp", rotulo: "Grupos de WhatsApp", icone: "chat-dots",
    caminhosRelacionados: ["/grupos-whatsapp/"],
  },
];

const itensAdmin: ItemNavegacao[] = [
  {
    // A seção Usuários reúne as abas Alunos, Professores e Secretaria.
    // O clique abre Alunos; as demais abas permanecem na listagem.
    caminho: "/gerenciarUsuarios/ALUNO", rotulo: "Usuários", icone: "people",
    caminhosRelacionados: [
      "/gerenciarUsuarios/", "/cadastrarUsuario/", "/editarUsuario/", "/alunos/",
    ],
  },
  {
    caminho: "/gerenciarTurmas", rotulo: "Turmas", icone: "collection",
    caminhosRelacionados: ["/cadastrarTurmas", "/editarTurmas", "/turmas/"],
  },
  {
    caminho: "/gerenciarCursos", rotulo: "Cursos", icone: "book",
    caminhosRelacionados: ["/cadastrarCursos", "/editarCursos"],
  },
];

const nomesPerfil: Record<PerfilUsuario, string> = {
  ADMIN: "Administrador",
  SECRETARIA: "Secretaria",
  PROFESSOR: "Professor",
  ALUNO: "Aluno",
};

function itemEstaAtivo(item: ItemNavegacao, pathname: string): boolean {
  if (pathname === item.caminho) return true;
  if (item.caminho !== "/eventos" && pathname.startsWith(`${item.caminho}/`)) return true;
  // A rota /eventos/:id pertence à gestão; /eventos sozinho é o calendário.
  if (item.caminhosRelacionados?.some((caminho) => pathname.startsWith(caminho))) return true;
  return false;
}

function SecaoNavegacao({ titulo, itens, pathname, onFechar }: {
  titulo: string;
  itens: ItemNavegacao[];
  pathname: string;
  onFechar: () => void;
}) {
  return (
    <div className="sice-sidebar__secao">
      <span className="sice-sidebar__titulo-secao">{titulo}</span>
      <div className="sice-sidebar__lista">
        {itens.map((item) => {
          const ativo = itemEstaAtivo(item, pathname);
          return (
            <NavLink
              key={item.caminho}
              to={item.caminho}
              end
              onClick={onFechar}
              aria-current={ativo ? "page" : undefined}
              className={`sice-sidebar__link${ativo ? " sice-sidebar__link--ativo" : ""}`}
            >
              <i className={`bi bi-${item.icone}`} aria-hidden="true" />
              <span>{item.rotulo}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({
  nome, perfil, aberta, onFechar, onSair, saindo, erroSaida, fecharRef,
}: SidebarProps) {
  const { pathname } = useLocation();
  const gerencia = perfil === "ADMIN" || perfil === "SECRETARIA";
  const [contaAberta, setContaAberta] = useState(false);
  const contaRef = useRef<HTMLDivElement>(null);
  const gatilhoContaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!contaAberta) return;

    function fecharAoClicarFora(evento: PointerEvent) {
      if (!contaRef.current?.contains(evento.target as Node)) {
        setContaAberta(false);
      }
    }

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setContaAberta(false);
        gatilhoContaRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("pointerdown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [contaAberta]);

  return (
    <aside
      id="sice-sidebar"
      className={`sice-sidebar${aberta ? " sice-sidebar--aberta" : ""}`}
      aria-label="Menu principal do SICE"
    >
      <div className="sice-sidebar__marca">
        <NavLink to="/dashboard" className="sice-sidebar__logo" onClick={onFechar} aria-label="SICE, ir ao painel">
          <span className="sice-sidebar__logo-quadro" aria-hidden="true">
            <img className="sice-sidebar__logo-imagem" src={logoSice} alt="" />
          </span>
          <span className="sice-sidebar__logo-texto">
            <span className="sice-sidebar__marca-sigla">SICE</span>
            <span className="sice-sidebar__marca-descricao">Gestão de eventos escolares</span>
          </span>
        </NavLink>
        <button
          ref={fecharRef}
          className="sice-sidebar__fechar"
          type="button"
          onClick={onFechar}
          aria-label="Fechar menu"
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      </div>

      <nav className="sice-sidebar__navegacao" aria-label="Navegação do SICE">
        <SecaoNavegacao titulo="GERAL" itens={itensGerais} pathname={pathname} onFechar={onFechar} />
        {gerencia && (
          <SecaoNavegacao titulo="EVENTOS E AVISOS" itens={itensSecretaria} pathname={pathname} onFechar={onFechar} />
        )}
        {perfil === "ADMIN" && (
          <SecaoNavegacao titulo="ADMINISTRAÇÃO" itens={itensAdmin} pathname={pathname} onFechar={onFechar} />
        )}
      </nav>

      <div className="sice-sidebar__rodape">
        <div className="sice-sidebar__conta" ref={contaRef}>
          <button
            ref={gatilhoContaRef}
            type="button"
            className="sice-sidebar__identidade"
            aria-expanded={contaAberta}
            aria-controls="sice-sidebar-menu-conta"
            aria-label={`Opções da conta de ${nome}`}
            onClick={() => setContaAberta((abertaAgora) => !abertaAgora)}
          >
            <span className="sice-sidebar__avatar" aria-hidden="true">
              <i className="bi bi-person-circle" />
            </span>
            <span className="sice-sidebar__perfil">
              <strong title={nome}>{nome}</strong>
              <small>{nomesPerfil[perfil]}</small>
            </span>
            <i className={`bi bi-chevron-${contaAberta ? "down" : "up"} sice-sidebar__seta-conta`} aria-hidden="true" />
          </button>
          {contaAberta && (
            <div className="sice-sidebar__menu-conta" id="sice-sidebar-menu-conta" aria-label="Opções da conta">
              <NavLink
                to="/minha-conta/alterar-senha"
                className="sice-sidebar__opcao-conta"
                onClick={() => {
                  setContaAberta(false);
                  onFechar();
                }}
              >
                <i className="bi bi-key" aria-hidden="true" />
                <span>Alterar senha</span>
              </NavLink>
              <div className="sice-sidebar__divisor-conta" />
              <button
                type="button"
                className="sice-sidebar__opcao-conta sice-sidebar__opcao-conta--sair"
                onClick={() => {
                  setContaAberta(false);
                  onSair();
                }}
                disabled={saindo}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                <span>{saindo ? "Saindo..." : "Sair do sistema"}</span>
              </button>
            </div>
          )}
        </div>
        {erroSaida && <p className="sice-sidebar__erro" role="alert">{erroSaida}</p>}
      </div>
    </aside>
  );
}
