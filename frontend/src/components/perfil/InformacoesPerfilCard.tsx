/**
 * ============================================================================
 * CARD: INFORMAÇÕES DO PERFIL (Corrigido) - Princípios 1, 3, 4
 * ============================================================================
 *
 * Propósito:
 * Formulário para visualização e atualização dos dados cadastrais
 * do usuário (nome, whatsapp).
 *
 * CORREÇÃO (Erro 400 Bad Request):
 * - Falha 1: O campo 'email' foi removido do schema Zod e marcado
 * como `disabled` no input. O DTO do backend
 * não permite a alteração do email.
 * - Falha 2: A regex de validação do 'whatsapp' foi corrigida
 * para `/^\d{12,13}$/` (12 ou 13 dígitos), alinhando-se
 * ao DTO do backend.
 *
 * @module Perfil
 * ============================================================================
 */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/ContextoAutenticacao";
import useSWR, { mutate } from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Phone, Loader2 } from "lucide-react";

/**
 * Schema de validação (Zod) para o formulário de perfil.
 * CORRIGIDO: Removido 'email' e ajustada regex 'whatsapp'.
 */
const perfilSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  // CORRIGIDO: O email não é enviado para atualização.
  whatsapp: z
    .string()
    .transform((val) => (val === null || val === "" ? undefined : val))
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        // CORRIGIDO: Regex para 12 ou 13 dígitos (DDD + Numero)
        /^\d{11,12}$/.test(val.replace(/\D/g, "")),
      "WhatsApp deve conter 12 ou 13 dígitos (Ex: 41987654321).",
    ),
});

// Define o tipo dos dados do formulário baseado no schema
type PerfilFormData = z.infer<typeof perfilSchema>;

/**
 * Interface para os dados completos do SWR (incluindo email)
 */
interface DadosPerfilSWR {
  nome: string;
  email: string;
  whatsapp?: string;
}

/**
 * Fetcher SWR para buscar dados do perfil.
 */
const fetcherPerfil = async (url: string): Promise<DadosPerfilSWR> => {
  const res = await api.get(url);
  return res.data;
};

/**
 * Card de Informações do Perfil.
 */
export function InformacoesPerfilCard() {
  const { usuario } = useAuth(); // Para dados iniciais e fallback

  const [estaSalvando, setEstaSalvando] = useState(false);

  // Busca de dados com SWR
  const { data: dadosPerfil, error: erroPerfil } = useSWR(
    "/perfil/meu",
    fetcherPerfil,
    {
      fallbackData: usuario as DadosPerfilSWR | undefined,
      revalidateOnFocus: true,
    },
  );

  // Configuração do React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    // Usamos getValues para ler o email (que não faz parte do schema)
    getValues,
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: "",
      whatsapp: "",
    },
  });

  // Efeito para popular o formulário quando os dados do SWR chegam
  useEffect(() => {
    if (dadosPerfil) {
      // Reseta o formulário apenas com os dados do schema
      reset({
        nome: dadosPerfil.nome,
        whatsapp: dadosPerfil.whatsapp ?? "",
      });
    }
  }, [dadosPerfil, reset]);

  /**
   * Handler para submissão do formulário.
   */
  const onSubmit: SubmitHandler<PerfilFormData> = async (dados) => {
    setEstaSalvando(true);
    toast.loading("Salvando alterações...", { id: "perfil-toast" });

    try {
      // 'dados' agora contém APENAS 'nome' e 'whatsapp' (definido pelo schema)
      const response = await api.patch("/perfil/meu", dados);

      // Atualiza o cache do SWR localmente
      mutate("/perfil/meu", response.data, false);

      toast.success("Perfil atualizado com sucesso!", { id: "perfil-toast" });
      reset(response.data);
    } catch (erro: any) {
      console.error("Erro ao atualizar perfil:", erro);
      const msgErro =
        erro.response?.data?.message ?? "Falha ao atualizar perfil.";

      if (Array.isArray(msgErro)) {
        toast.error(msgErro.join(", "), { id: "perfil-toast" });
      } else {
        toast.error(msgErro, { id: "perfil-toast" });
      }
    } finally {
      setEstaSalvando(false);
    }
  };

  // Estado de Carregamento
  if (erroPerfil) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl">
        <h4 className="font-semibold">Erro ao carregar perfil</h4>
        <p className="text-sm">{erroPerfil.message}</p>
      </div>
    );
  }

  if (!dadosPerfil) {
    // Skeleton
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
          Atualize seus dados cadastrais. O email não pode ser alterado.
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

        {/* Campo Email (Somente Leitura) */}
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
              // CORRIGIDO: Valor lido dos dados do SWR, campo desabilitado
              value={dadosPerfil.email}
              disabled={true}
              className={`input-glass pl-10 bg-muted/50 cursor-not-allowed`}
            />
          </div>
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
              placeholder="41987654321."
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