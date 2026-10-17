import type { ReactNode } from "react";
import "./autenticacao.css";

type Props = {
  titulo: string;
  descricao: string;
  icone: string;
  children: ReactNode;
};

/** Layout visual compartilhado; não interfere na autenticação ou nos formulários. */
export default function LayoutAutenticacao({ titulo, descricao, icone, children }: Props) {
  return (
    <main className="sice-auth">
      <div className="sice-auth__estrutura">
        <aside className="sice-auth__institucional" aria-label="Identidade do SICE">
          <div className="sice-auth__marca">
            <span className="sice-auth__marca-icone" aria-hidden="true">
              <i className="bi bi-mortarboard" />
            </span>
            <div className="sice-auth__marca-texto">
              {/* Marca tipográfica provisória: substituir pelo logotipo oficial futuramente. */}
              <strong>SICE</strong>
              <small>Gestão de eventos escolares</small>
            </div>
          </div>

          <div className="sice-auth__institucional-texto">
            <span className="sice-auth__eyebrow">Plataforma escolar</span>
            <h2>Organização e comunicação em um só lugar.</h2>
            <p>
              Consulte eventos, acompanhe comunicados e acesse as ferramentas
              da instituição de acordo com seu perfil.
            </p>
          </div>

          <div className="sice-auth__institucional-rodape">
            <i className="bi bi-shield-check" aria-hidden="true" />
            <span>Acesso destinado à comunidade escolar</span>
          </div>
        </aside>

        <section className="sice-auth__conteudo" aria-labelledby="sice-auth-titulo">
          <div className="sice-auth__painel">
            <div className="sice-auth__introducao">
              <span className="sice-auth__titulo-icone" aria-hidden="true">
                <i className={`bi ${icone}`} />
              </span>
              <h1 id="sice-auth-titulo">{titulo}</h1>
              <p>{descricao}</p>
            </div>
            {children}
          </div>
          <p className="sice-auth__conteudo-rodape">SICE · Sistema de eventos escolares</p>
        </section>
      </div>
    </main>
  );
}
