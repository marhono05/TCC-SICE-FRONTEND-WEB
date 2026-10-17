/** Mensagem de apoio calculada pelo backend; nao comprova entrega ou ausencia de envio. */
export interface DiagnosticoErroBot {
  codigo: string;
  mensagem: string;
  orientacao: string;
}
