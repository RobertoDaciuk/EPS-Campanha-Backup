/**
 * ============================================================================
 * CARD: INFORMAÇÕES DO PERFIL (Implementado) - Princípios 1, 3, 4
 * ============================================================================
 *
 * Propósito:
 * Formulário para visualização e atualização dos dados cadastrais
 * do usuário (nome, email, whatsapp).
 *
 * Implementação:
 * - Busca dados de `GET /api/perfil/meu` via SWR.
 * - Envia atualizações para `PATCH /api/perfil/meu`.
 * - Usa `react-hook-form` e `zod` para validação robusta.
 * - Design Magnífico (Princípio 4).
 *
 * @module Perfil
 * ============================================================================
 */
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/ContextoAutenticacao";
import useSWR, { mutate } from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Phone, Loader2 } from "lucide-react";
import { KpiCard } from "../dashboard/KpiCard"; // Reutilizando o KpiCard como skeleton

/**
 * Schema de validação (Zod) para o formulário de perfil.
 */
const perfilSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de email inválido."),
  whatsapp: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined || val === "" || /^\d{10,11}$/.test(val.replace(/\D/g, "")),
      "O WhatsApp deve ter 10 ou 11 dígitos (DDD + número).",
    ),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

/**
 * Fetcher SWR para buscar dados do perfil.
 */
const fetcherPerfil = async (url: string) => {
  const res = await api.get(url);
  return res.data;
};

/**
 * Card de Informações do Perfil.
 */
export function InformacoesPerfilCard() {
  const { usuario } = useAuth(); // Para dados iniciais e fallback

  // Estado de carregamento do submit
  const [estaSalvando, setEstaSalvando] = useState(false);

  // Busca de dados com SWR
  const { data: dadosPerfil, error: erroPerfil } = useSWR(
    "/perfil/meu",
    fetcherPerfil,
    {
      // Popula dados iniciais com o contexto para evitar piscar
      fallbackData: usuario,
    },
  );

  // Configuração do React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    // Define valores padrão ou atuais assim que o SWR carregar
    values: {
      nome: dadosPerfil?.nome ?? "",
      email: dadosPerfil?.email ?? "",
      whatsapp: dadosPerfil?.whatsapp ?? "",
    },
  });

  /**
   * Handler para submissão do formulário.
   */
  const onSubmit = async (dados: PerfilFormData) => {
    setEstaSalvando(true);
    toast.loading("Salvando alterações...", { id: "perfil-toast" });

    try {
      // Envia dados para o endpoint PATCH
      const response = await api.patch("/perfil/meu", dados);

      // Atualiza o cache do SWR localmente (mutação otimista)
      mutate("/perfil/meu", response.data, false);

      // Atualiza o estado do AuthContext (se o nome mudou)
      // TODO: Implementar atualização do AuthContext se o nome mudar

      toast.success("Perfil atualizado com sucesso!", { id: "perfil-toast" });
      reset(response.data); // Reseta o formulário com os novos dados
    } catch (erro: any) {
      console.error("Erro ao atualizar perfil:", erro);
      const msgErro =
        erro.response?.data?.message ?? "Falha ao atualizar perfil.";
      toast.error(msgErro, { id: "perfil-toast" });
    } finally {
      setEstaSalvando(false);
    }
  };

  // Estado de Carregamento (Princípio 4)
  if (!dadosPerfil && !erroPerfil) {
    return (
      <div className="bg-card/70 backdrop-blur-lg border border-border/20 rounded-2xl p-6 shadow-lg shadow-black/5 animate-pulse">
        <div className="h-6 bg-muted-foreground/20 rounded-md w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-10 bg-muted-foreground/20 rounded-md w-full"></div>
          <div className="h-10 bg-muted-foreground/20 rounded-md w-full"></div>
          <div className="h-10 bg-muted-foreground/20 rounded-md w-full"></div>
          <div className="h-10 bg-muted-foreground/20 rounded-md w-1/4 mt-4"></div>
        </div>
      </div>
    );
  }

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
          Informações Pessoais
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Atualize seus dados cadastrais. O email é usado para login.
        </p>
      </div>

      {/* Corpo do Formulário */}
      <div className="p-5 md:p-6 space-y-4">
        {/* Campo Nome */}
        <div>
          <label
            htmlFor="nome"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Nome Completo
          </label>
          <div className="relative group">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="nome"
              type="text"
              {...register("nome")}
              disabled={estaSalvando}
              className={`input-glass pl-10 ${errors.nome ? "border-destructive" : ""}`}
            />
          </div>
          {errors.nome && (
            <p className="text-xs text-destructive mt-1">
              {errors.nome.message}
            </p>
          )}
        </div>

        {/* Campo Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Email (Login)
          </label>
          <div className="relative group">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              {...register("email")}
              disabled={estaSalvando}
              className={`input-glass pl-10 ${errors.email ? "border-destructive" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Campo WhatsApp */}
        <div>
          <label
            htmlFor="whatsapp"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            WhatsApp (Opcional)
          </label>
          <div className="relative group">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="whatsapp"
              type="tel"
              placeholder="(DD) 9XXXX-XXXX"
              {...register("whatsapp")}
              disabled={estaSalvando}
              className={`input-glass pl-10 ${errors.whatsapp ? "border-destructive" : ""}`}
            />
          </div>
          {errors.whatsapp && (
            <p className="text-xs text-destructive mt-1">
              {errors.whatsapp.message}
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
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </button>
      </div>
    </form>
  );
}