/** Normaliza consultas locais (maiúsculas e acentos) sem modificar os dados exibidos. */
export function normalizarPesquisaListagem(texto: string): string {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}
