# SICE — Frontend Web

Interface web do **Sistema Integrado de Comunicação de Eventos (SICE)**, desenvolvida em React, TypeScript e Vite para acompanhamento e gerenciamento de eventos escolares.

## Requisitos

- Node.js compatível com as dependências descritas em `package.json`.
- Backend Spring Boot do SICE, acessível em `http://localhost:8080` (configuração atual em `src/services/api.ts`).

## Executar localmente

```powershell
npm ci
npm run dev
```

O Vite exibe no terminal o endereço local do frontend. Para validar a versão de produção e o código:

```powershell
npm run build
npm run lint
```

> Importante: `npm run dev` apenas inicia o frontend. Os recursos que consultam a API exigem o backend em execução e as permissões correspondentes. Não há alterações no contrato HTTP nesta reorganização.

## Organização do código

- `src/components/ui/`: campos, botões, etiquetas, avisos e outros componentes visuais genéricos.
- `src/components/eventos/`: componentes específicos dos eventos (alerta de grupos, confirmação de cancelamento, etiqueta de status).
- `src/components/avisos/`: painel e etiqueta de status das comunicações.
- `src/components/Form*/`: formulários por funcionalidade com seus estilos.
- `src/components/Sidebar/`: navegação por perfil.
- `src/layouts/`: cascas das páginas, autenticação e layout principal.
- `src/pages/`: telas e rotas administrativas, calendário e autenticação.
- `src/services/`: integração com a API do Spring Boot.
- `src/types/` e `src/schemas/`: tipos e validações.
- `src/hooks/`, `src/utils/`, `src/routes/`, `src/providers/`: hooks, utilitários, regras de rotas e contexto de login.
- `src/styles/global.css`: estilo e tokens globais.

## Permissões e recursos

A aplicação oferece visualizações adaptadas aos perfis ADMIN, SECRETARIA, PROFESSOR e ALUNO. Os fluxos incluem calendário, gerenciamento de eventos, usuários, cursos, turmas, grupos de WhatsApp, Central de Avisos e comunicação de cancelamentos. O controle de acesso é validado também pelo backend.

## Identidade visual

A interface utiliza Inter, Bootstrap Icons e as cores institucionais do SICE. O favicon é um símbolo vetorial provisório de calendário; a logo oficial pode ser incorporada depois.

## Segurança e testes

Não coloque credenciais ou segredos no repositório. As permissões exibidas no React não substituem a validação do backend. Após mudanças de estrutura, execute `npm run build` e `npm run lint` e confira os fluxos de navegação por perfil.
