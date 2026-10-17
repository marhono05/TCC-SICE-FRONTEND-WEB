# SICE — Reorganização pontual do frontend

## Base utilizada

`front-revisão-geral.zip`, fornecido na conversa. Esta entrega não modifica backend, bot, serviços da API, formulários, rotas ou regras de negócio.

## Qual pacote escolher?

- **Frontend completo:** contém a versão integral reorganizada. Faça backup da sua pasta atual antes de substituir qualquer arquivo. Útil para conferir a estrutura como um todo.
- **Somente alterações (recomendado se há mudanças locais):** copie o conteúdo do ZIP para a **raiz do projeto frontend**, mantendo `src/`, `public/`, `package.json` e `package-lock.json`. Depois execute `Remover-Arquivos-Antigos.ps1`, também na raiz, para evitar duplicatas de componentes.

> Não misture apenas parte dos arquivos: os imports foram atualizados conjuntamente. Se modificou um desses arquivos depois do ZIP original, compare as diferenças antes de sobrescrever.

## O que foi feito?

1. `components/eventos/`: alerta de grupos, confirmação e status dos eventos, cada um com seu CSS próprio quando aplicável.
2. `components/avisos/`: painel dos comunicados de cancelamento e etiqueta dos status. A etiqueta não importa mais CSS de `pages`.
3. `layouts/LayoutAutenticacao/` e `layouts/PaginaFormulario/`: layouts e estilos próprios, junto ao `LayoutPrincipal` existente.
4. `components/ui/`: permanecem os componentes de interface reutilizáveis.
5. A pesquisa de usuários passa a reutilizar `utils/pesquisaListagem.ts` sem mudar a normalização.
6. Limpeza de assets sem referências, CSS antigo de senha e dependência `@fullcalendar/timegrid` sem uso; `package-lock.json` atualizado junto ao `package.json`.
7. Metadados HTML corrigidos para pt-BR, título do SICE, favicon simples institucional e README com orientações de execução.

## Limpeza de arquivos antigos

Este script remove **somente** estes caminhos já substituídos ou sem uso (e não remove arquivos pessoais):

- `public/icons.svg`
- `src/assets/hero.png`
- `src/assets/react.svg`
- `src/assets/vite.svg`
- `src/components/AlertaGrupoEvento/AlertaGruposEvento.tsx`
- `src/components/ComunicacoesCancelamento/ComunicacoesCancelamentoPainel.tsx`
- `src/components/ConfirmarCancelamento/ConfirmarCancelamentoEvento.css`
- `src/components/ConfirmarCancelamento/ConfirmarCancelamentoEvento.tsx`
- `src/components/ui/EtiquetaStatusAviso.tsx`
- `src/components/ui/EtiquetaStatusEvento.tsx`
- `src/components/ui/LayoutAutenticacao.tsx`
- `src/components/ui/PaginaFormulario.tsx`
- `src/components/ui/autenticacao.css`
- `src/components/ui/pagina-formulario.css`
- `src/pages/auth/AlterarSenha/AlterarSenhaPage.css`

Execute no PowerShell, dentro da pasta frontend, **depois de copiar os novos arquivos**:

```powershell
.\Remover-Arquivos-Antigos.ps1
```

Caso a execução de scripts esteja bloqueada, apague manualmente apenas os caminhos da lista acima, sem mudar a política de segurança do PowerShell.

## Validar

```powershell
npm ci
npm run build
npm run lint
npm run dev
```

Faça os seguintes testes manuais: menu de Usuários e suas abas, cadastro e edição dos cinco tipos, login e primeiro acesso, calendário em desktop/mobile, cancelamento de eventos com e sem comunicação (usando ambiente de testes), Central de Avisos, histórico de tentativas, matrículas e redirecionamentos por perfil.

## Validação realizada neste ambiente

- Parsing de 89 arquivos TS/TSX/JS: sem erros sintáticos.
- 398 imports relativos: sem caminhos quebrados.
- 21 arquivos CSS: analisados sem erros sintáticos.
- Consistência dos nomes das dependências entre `package.json` e `package-lock.json`.
- **Não foi possível executar `npm run build` / `npm run lint` por ausência das dependências no ambiente.** O build acusou falta de `vite/client` e tipos do Node; isso não demonstra erro do projeto. Os comandos acima são a validação final na sua máquina.

## Histórico e segurança

Não foram alteradas as regras de autenticação, envio/cancelamento, destinatários ou fluxos de formulários. A reorganização por si só não acrescenta funcionalidades novas. Faça backup antes de mesclar, especialmente se houver modificações posteriores ao ZIP-base.
