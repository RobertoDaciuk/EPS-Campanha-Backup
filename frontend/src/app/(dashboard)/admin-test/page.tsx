"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Shield, CheckCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

/**
 * Página de Teste - Apenas ADMIN
 * 
 * Características:
 * - Proteção de rota baseada em papel
 * - Redireciona não autenticados para /login
 * - Redireciona não-admins para /
 * - Mostra conteúdo secreto apenas para ADMINs
 * - Loading state durante verificação
 */
export default function AdminTestPage() {
  const router = useRouter();
  const { usuario, estaAutenticado, isLoading } = useAuth();

  // ========================================
  // PROTEÇÃO DE ROTA BASEADA EM PAPEL
  // ========================================

  useEffect(() => {
    // Aguarda carregamento inicial
    if (isLoading) return;

    // Não autenticado - redireciona para login
    if (!estaAutenticado) {
      router.push("/login");
      return;
    }

    // Autenticado mas não é ADMIN - redireciona para dashboard
    if (usuario?.papel !== "ADMIN") {
      toast.error("Acesso não autorizado! Apenas administradores podem acessar esta página.");
      router.push("/");
      return;
    }
  }, [isLoading, estaAutenticado, usuario, router]);

  // ========================================
  // LOADING STATE OU NÃO AUTORIZADO
  // ========================================

  if (isLoading || !estaAutenticado || usuario?.papel !== "ADMIN") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // CONTEÚDO SECRETO DO ADMIN
  // ========================================

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ========================================
          HEADER
          ======================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark mb-4">
          <Shield className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-bold">
          <span className="text-gradient">Página Secreta do Admin</span>
        </h1>
        
        <p className="text-muted-foreground text-lg">
          Apenas usuários com papel de <span className="font-semibold text-primary">ADMINISTRADOR</span> podem acessar esta página
        </p>
      </motion.div>

      {/* ========================================
          INFORMAÇÕES DO USUÁRIO
          ======================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="glass rounded-2xl p-8 space-y-6"
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-success" />
          <h2 className="text-2xl font-semibold">Acesso Autorizado</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">Nome:</span>
            <span className="font-semibold">{usuario?.nome}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-semibold">{usuario?.email}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">Papel:</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
              <Shield className="w-4 h-4 mr-1" />
              {usuario?.papel}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-muted-foreground">ID do Usuário:</span>
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {usuario?.id}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ========================================
          RECURSOS ADMINISTRATIVOS (PLACEHOLDER)
          ======================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Card 1 */}
        <div className="glass rounded-2xl p-6 space-y-4 hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Gestão de Usuários</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Criar, editar e gerenciar usuários do sistema
          </p>
          <div className="pt-2">
            <span className="text-xs text-muted-foreground">Em desenvolvimento...</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass rounded-2xl p-6 space-y-4 hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Ajustar parâmetros globais da plataforma
          </p>
          <div className="pt-2">
            <span className="text-xs text-muted-foreground">Em desenvolvimento...</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass rounded-2xl p-6 space-y-4 hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Logs do Sistema</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Visualizar atividades e auditoria
          </p>
          <div className="pt-2">
            <span className="text-xs text-muted-foreground">Em desenvolvimento...</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass rounded-2xl p-6 space-y-4 hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Relatórios Avançados</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Análises detalhadas e exportação de dados
          </p>
          <div className="pt-2">
            <span className="text-xs text-muted-foreground">Em desenvolvimento...</span>
          </div>
        </div>
      </motion.div>

      {/* ========================================
          NOTA DE TESTE
          ======================================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="glass rounded-xl p-6 border-l-4 border-primary"
      >
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Página de Teste RBAC</h4>
            <p className="text-sm text-muted-foreground">
              Esta é uma página de demonstração para validar o sistema de autorização baseado em papéis (RBAC).
              Apenas usuários com papel <span className="font-semibold text-primary">ADMIN</span> podem visualizar este conteúdo.
              Usuários com outros papéis serão automaticamente redirecionados para o dashboard principal.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}