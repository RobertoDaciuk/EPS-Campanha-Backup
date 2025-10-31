/**
 * ============================================================================
 * PÁGINA DE PERFIL (Implementada) - Princípios 1, 2, 3
 * ============================================================================
 *
 * Propósito:
 * Página principal para o gerenciamento de perfil do usuário.
 * Renderiza os componentes para alterar informações pessoais e senha.
 *
 * Implementação:
 * - Usa `useAuth` (PT-BR) para obter dados do usuário (Princípio 2).
 * - Renderiza os componentes filhos em um layout de grid.
 *
 * @module PerfilPage
 * ============================================================================
 */
"use client";

import { useAuth } from "@/contexts/ContextoAutenticacao";
import { AlterarSenhaCard } from "@/components/perfil/AlterarSenhaCard";
import { InformacoesPerfilCard } from "@/components/perfil/InformacoesPerfilCard";
import { motion } from "framer-motion";

/**
 * Página de gerenciamento de perfil do usuário.
 */
export default function PerfilPage() {
  const { usuario } = useAuth();

  const nomeUsuario = usuario?.nome.split(" ")[0] ?? "Usuário";

  return (
    <div className="flex-1 space-y-6">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight">
          Perfil de {nomeUsuario}
        </h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações de segurança.
        </p>
      </motion.div>

      {/* Grid de Cards (Princípio 4) */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Coluna 1: Informações Pessoais (Ocupa 2 colunas no LG) */}
        <div className="lg:col-span-2">
          <InformacoesPerfilCard />
        </div>

        {/* Coluna 2: Alterar Senha (Ocupa 1 coluna no LG) */}
        <div className="lg:col-span-1">
          <AlterarSenhaCard />
        </div>
      </motion.div>
    </div>
  );
}