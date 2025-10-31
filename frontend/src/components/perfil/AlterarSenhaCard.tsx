/**
 * ============================================================================
 * CARD: ALTERAR SENHA (Implementado) - Princípios 1, 3, 4
 * ============================================================================
 *
 * Propósito:
 * Formulário para atualização da senha do usuário.
 *
 * Implementação:
 * - Envia dados para `PATCH /api/perfil/minha-senha`.
 * - Usa `react-hook-form` e `zod` para validação (incluindo confirmação).
 * - Design Magnífico (Princípio 4).
 *
 * @module Perfil
 * ============================================================================
 */
"use client";

import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Key, Loader2 } from "lucide-react";

/**
 * Schema de validação (Zod) para o formulário de alteração de senha.
 *
 */
const senhaSchema = z
  .object({
    senhaAtual: z
      .string()
      .min(1, "A senha atual é obrigatória."),
    novaSenha: z
      .string()
      .min(8, "A nova senha deve ter no mínimo 8 caracteres.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        "Deve conter maiúscula, minúscula, número e caractere especial.",
      ),
    confirmarNovaSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: "As novas senhas não coincidem.",
    path: ["confirmarNovaSenha"], // Indica qual campo recebe o erro
  });

type SenhaFormData = z.infer<typeof senhaSchema>;

/**
 * Card de Alteração de Senha.
 */
export function AlterarSenhaCard() {
  // Estado de carregamento do submit
  const [estaSalvando, setEstaSalvando] = useState(false);

  // Configuração do React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SenhaFormData>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarNovaSenha: "",
    },
  });

  /**
   * Handler para submissão do formulário.
   */
  const onSubmit = async (dados: SenhaFormData) => {
    setEstaSalvando(true);
    toast.loading("Atualizando senha...", { id: "senha-toast" });

    try {
      // Envia dados para o endpoint PATCH
      await api.patch("/perfil/minha-senha", {
        senhaAtual: dados.senhaAtual,
        novaSenha: dados.novaSenha,
      });

      toast.success("Senha atualizada com sucesso!", { id: "senha-toast" });
      reset(); // Limpa o formulário
    } catch (erro: any) {
      console.error("Erro ao atualizar senha:", erro);
      const msgErro =
        erro.response?.data?.message ?? "Falha ao atualizar senha.";
      toast.error(msgErro, { id: "senha-toast" });
    } finally {
      setEstaSalvando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card/70 backdrop-blur-lg 
                 border border-border/20 rounded-2xl 
                 shadow-lg shadow-black/5"
    >
      {/* Cabeçalho do Card */}
      <div className="p-5 md:p-6 border-b border-border/20">
        <h3 className="text-lg font-semibold text-foreground">
          Alterar Senha
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Recomendamos o uso de uma senha forte e única.
        </p>
      </div>

      {/* Corpo do Formulário */}
      <div className="p-5 md:p-6 space-y-4">
        {/* Campo Senha Atual */}
        <div>
          <label
            htmlFor="senhaAtual"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Senha Atual
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="senhaAtual"
              type="password"
              {...register("senhaAtual")}
              disabled={estaSalvando}
              className={`input-glass pl-10 ${errors.senhaAtual ? "border-destructive" : ""}`}
            />
          </div>
          {errors.senhaAtual && (
            <p className="text-xs text-destructive mt-1">
              {errors.senhaAtual.message}
            </p>
          )}
        </div>

        {/* Campo Nova Senha */}
        <div>
          <label
            htmlFor="novaSenha"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Nova Senha
          </label>
          <div className="relative group">
            <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="novaSenha"
              type="password"
              {...register("novaSenha")}
              disabled={estaSalvando}
              className={`input-glass pl-10 ${errors.novaSenha ? "border-destructive" : ""}`}
            />
          </div>
          {errors.novaSenha && (
            <p className="text-xs text-destructive mt-1">
              {errors.novaSenha.message}
            </p>
          )}
        </div>

        {/* Campo Confirmar Nova Senha */}
        <div>
          <label
            htmlFor="confirmarNovaSenha"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Confirmar Nova Senha
          </label>
          <div className="relative group">
            <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmarNovaSenha"
              type="password"
              {...register("confirmarNovaSenha")}
              disabled={estaSalvando}
              className={`input-glass pl-10 ${errors.confirmarNovaSenha ? "border-destructive" : ""}`}
            />
          </div>
          {errors.confirmarNovaSenha && (
            <p className="text-xs text-destructive mt-1">
              {errors.confirmarNovaSenha.message}
            </p>
          )}
        </div>
      </div>

      {/* Rodapé do Card */}
      <div className="p-5 md:p-6 border-t border-border/20 flex justify-end">
        <button
          type="submit"
          disabled={estaSalvando}
          className="btn btn-primary"
        >
          {estaSalvando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Alterando...
            </>
          ) : (
            "Alterar Senha"
          )}
        </button>
      </div>
    </form>
  );
}