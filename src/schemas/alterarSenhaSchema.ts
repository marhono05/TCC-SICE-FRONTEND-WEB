import { z } from "zod";

export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe sua senha atual."),
    novaSenha: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmarSenha: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((dados) => dados.senhaAtual !== dados.novaSenha, {
    path: ["novaSenha"],
    message: "A nova senha precisa ser diferente da atual.",
  })
  .refine((dados) => dados.novaSenha === dados.confirmarSenha, {
    path: ["confirmarSenha"],
    message: "As senhas não coincidem.",
  });

export type AlterarSenhaFormData = z.infer<typeof alterarSenhaSchema>;
