import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./LayoutPrincipal.css";

function nomeDaPagina(pathname: string): string {
  if (pathname === "/dashboard") return "Painel";
  if (pathname === "/eventos") return "Calendário escolar";
  if (pathname.startsWith("/avisos")) return "Central de avisos";
  if (pathname.startsWith("/gerenciarEventos") || pathname.startsWith("/cadastrarEventos")
    || pathname.startsWith("/editarEventos") || pathname.startsWith("/eventos/")) return "Gerenciar eventos";
  if (pathname.startsWith("/gerenciarUsuarios/ALUNO") || pathname.startsWith("/cadastrarUsuario/ALUNO")
    || pathname.startsWith("/alunos/")) return "Alunos";
  if (pathname.startsWith("/gerenciarUsuarios/PROFESSOR") || pathname.startsWith("/cadastrarUsuario/PROFESSOR")) return "Professores";
  if (pathname.startsWith("/editarUsuario/")) return "Editar usuário";
  if (pathname.includes("Turmas") || pathname.startsWith("/turmas/")) return "Turmas";
  if (pathname.includes("Cursos")) return "Cursos";
  if (pathname.includes("GruposWhatsapp") || pathname.startsWith("/grupos-whatsapp/")) return "Grupos de WhatsApp";
  return "SICE";
}

export default function LayoutPrincipal() {
  const { usuario, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erroSaida, setErroSaida] = useState("");
  const botaoMenuRef = useRef<HTMLButtonElement>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuAberto) return;
    const fundoAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botaoFecharRef.current?.focus();

    function aoPressionarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuAberto(false);
        botaoMenuRef.current?.focus();
      }
      if (event.key === "Tab") {
        const focoAtual = document.activeElement;
        const focaveis = Array.from(document.querySelectorAll<HTMLElement>(
          '#sice-sidebar a[href], #sice-sidebar button:not([disabled])',
        )).filter((elemento) => elemento.getClientRects().length > 0);
        if (!focaveis.length) return;
        if (event.shiftKey && focoAtual === focaveis[0]) {
          event.preventDefault();
          focaveis[focaveis.length - 1].focus();
        } else if (!event.shiftKey && focoAtual === focaveis[focaveis.length - 1]) {
          event.preventDefault();
          focaveis[0].focus();
        }
      }
    }

    function aoMudarLargura(evento: MediaQueryListEvent) {
      if (!evento.matches) setMenuAberto(false);
    }
    const mobile = window.matchMedia("(max-width: 899px)");
    mobile.addEventListener("change", aoMudarLargura);
    document.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.body.style.overflow = fundoAnterior;
      document.removeEventListener("keydown", aoPressionarTecla);
      mobile.removeEventListener("change", aoMudarLargura);
    };
  }, [menuAberto]);

  function fecharMenu() {
    setMenuAberto(false);
    if (window.matchMedia("(max-width: 899px)").matches) {
      botaoMenuRef.current?.focus();
    }
  }

  async function sair() {
    if (saindo) return;
    setErroSaida("");
    setSaindo(true);
    try {
      await logout();
    } catch {
      setErroSaida("Não foi possível sair agora. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  }

  if (!usuario) return null;

  return (
    <div className="sice-layout">
      <Sidebar
        perfil={usuario.perfil}
        aberta={menuAberto}
        onFechar={fecharMenu}
        onSair={() => { void sair(); }}
        saindo={saindo}
        erroSaida={erroSaida}
        fecharRef={botaoFecharRef}
      />
      {menuAberto && (
        <button
          type="button"
          className="sice-layout__sobreposicao"
          aria-label="Fechar menu de navegação"
          onClick={() => {
            fecharMenu();
          }}
        />
      )}
      <div className="sice-layout__area">
        <header className="sice-layout__topo">
          <div className="sice-layout__topo-inicio">
            <button
              ref={botaoMenuRef}
              type="button"
              className="sice-layout__abrir-menu"
              aria-label="Abrir menu de navegação"
              aria-controls="sice-sidebar"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto(true)}
            >
              <i className="bi bi-list" aria-hidden="true" />
            </button>
            <div className="sice-layout__topo-titulo">
              <span className="sice-layout__topo-legenda">SICE · Gestão escolar</span>
              <strong>{nomeDaPagina(pathname)}</strong>
            </div>
          </div>
          <div className="sice-layout__topo-perfil">
            <i className="bi bi-person-circle" aria-hidden="true" />
            <span>{usuario.perfil === "ADMIN" ? "Administrador" : usuario.perfil === "SECRETARIA" ? "Secretaria" : usuario.perfil === "PROFESSOR" ? "Professor" : "Aluno"}</span>
          </div>
        </header>
        <div className="sice-layout__conteudo">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
