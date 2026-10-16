import { z } from "zod";

export const redefinirSenhaUsuarioSchema = z.object({
  senhaTemporaria: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").max(72, "A senha não pode ultrapassar 72 caracteres."),
  confirmarSenha: z.string().min(1, "Confirme a senha provisória."),
}).refine((dados) => dados.senhaTemporaria === dados.confirmarSenha, {
  path: ["confirmarSenha"],
  message: "As senhas não coincidem.",
});

export type RedefinirSenhaUsuarioFormData = z.infer<typeof redefinirSenhaUsuarioSchema>;
