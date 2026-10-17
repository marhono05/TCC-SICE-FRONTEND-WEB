# Execute na raiz do projeto frontend, APOS copiar os novos arquivos.
# Exclui somente caminhos antigos substituidos.
$ErrorActionPreference = "Stop"
$raiz = $PSScriptRoot
$antigos = @(
    "public/icons.svg",
    "src/assets/hero.png",
    "src/assets/react.svg",
    "src/assets/vite.svg",
    "src/components/AlertaGrupoEvento/AlertaGruposEvento.tsx",
    "src/components/ComunicacoesCancelamento/ComunicacoesCancelamentoPainel.tsx",
    "src/components/ConfirmarCancelamento/ConfirmarCancelamentoEvento.css",
    "src/components/ConfirmarCancelamento/ConfirmarCancelamentoEvento.tsx",
    "src/components/ui/EtiquetaStatusAviso.tsx",
    "src/components/ui/EtiquetaStatusEvento.tsx",
    "src/components/ui/LayoutAutenticacao.tsx",
    "src/components/ui/PaginaFormulario.tsx",
    "src/components/ui/autenticacao.css",
    "src/components/ui/pagina-formulario.css",
    "src/pages/auth/AlterarSenha/AlterarSenhaPage.css"
)
foreach ($relativo in $antigos) {
    $destino = Join-Path -Path $raiz -ChildPath $relativo
    if (Test-Path -LiteralPath $destino -PathType Leaf) {
        Remove-Item -LiteralPath $destino -Force
        Write-Host "Excluido: $relativo"
    }
}
Write-Host "Limpeza concluida. Rode npm ci, npm run build e npm run lint."
