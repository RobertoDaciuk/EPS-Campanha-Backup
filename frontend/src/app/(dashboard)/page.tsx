"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import { Loader2, TrendingUp, Users, Trophy, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

/**
 * ============================================================================
 * DASHBOARD PAGE - Página Principal do Dashboard (REFATORADO)
 * ============================================================================
 * 
 * Descrição:
 * Página principal do dashboard que renderiza KPIs específicos para cada
 * tipo de usuário (Admin, Gerente, Vendedor).
 * 
 * Fluxo:
 * 1. Verifica autenticação via AuthContext
 * 2. Busca dados do perfil via GET /perfil
 * 3. Renderiza componente de KPIs baseado no papel do usuário
 * 
 * @module DashboardPage
 * ============================================================================
 */

/**
 * Componente de Skeleton Loader para KPIs - COMPACTO
 */
function SkeletonKpiCard() {
  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-8 w-8 bg-muted rounded"></div>
      </div>
      <div className="h-8 bg-muted rounded w-32 mb-2"></div>
      <div className="h-3 bg-muted rounded w-40"></div>
    </div>
  );
}

/**
 * Página principal do Dashboard
 */
export default function DashboardPage() {
  const router = useRouter();
  const { usuario, estaAutenticado, logout } = useAuth();

  // ========================================
  // ESTADOS
  // ========================================

  const [carregando, setCarregando] = useState(true);
  const [dadosDashboard, setDadosDashboard] = useState<any>(null);

  // ========================================
  // BUSCAR DADOS DO DASHBOARD
  // ========================================

  useEffect(() => {
    const buscarDados = async () => {
      if (!estaAutenticado || !usuario) {
        setCarregando(false);
        return;
      }

      try {
        // ✅ CORRIGIDO: Rota ajustada para /perfil/meu
        const response = await api.get('/perfil/meu');
        setDadosDashboard(response.data);
      } catch (error: any) {
        console.error('❌ Erro ao buscar dados do dashboard:', error);
        
        // Se erro 401, token expirou → logout
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.');
          logout();
          return;
        }

        // Outros erros
        toast.error('Erro ao carregar dashboard. Tente novamente.');
      }
      finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [estaAutenticado, usuario, logout]);

  // ========================================
  // LOADING STATE
  // ========================================

  if (carregando) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </div>

        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonKpiCard />
          <SkeletonKpiCard />
          <SkeletonKpiCard />
          <SkeletonKpiCard />
        </div>

        {/* Loading Message */}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDERIZAR DASHBOARD POR PAPEL
  // ========================================

  /**
   * Renderiza dashboard baseado no papel do usuário
   */
  const renderDashboard = () => {
    if (!usuario) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mb-6">
            Não foi possível identificar seu perfil. Tente fazer login novamente.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Ir para Login
          </button>
        </motion.div>
      );
    }

    switch (usuario.papel) {
      case 'VENDEDOR':
        return <DashboardVendedor usuario={usuario} dados={dadosDashboard} />;
      
      case 'GERENTE':
        return <DashboardGerente usuario={usuario} dados={dadosDashboard} />;
      
      case 'ADMIN':
        return <DashboardAdmin usuario={usuario} dados={dadosDashboard} />;
      
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao EPS Campanhas</h2>
            <p className="text-muted-foreground mb-4">
              Seu papel ({usuario.papel}) ainda não possui um dashboard customizado.
            </p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o administrador para mais informações.
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Olá, {usuario?.nome?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está um resumo das suas atividades
        </p>
      </motion.div>

      {/* Dashboard Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {renderDashboard()}
      </motion.div>
    </div>
  );
}

// ============================================================================
// DASHBOARDS ESPECÍFICOS POR PAPEL
// ============================================================================

/**
 * Dashboard do Vendedor
 */
function DashboardVendedor({ usuario, dados }: any) {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titulo="Moedinhas"
          valor={usuario.saldoMoedinhas || 0}
          icon={<Trophy className="w-5 h-5" />}
          tendencia="+12%"
          cor="text-yellow-500"
        />
        <KpiCard
          titulo="Ranking"
          valor={`#${usuario.rankingMoedinhas || 0}`}
          icon={<TrendingUp className="w-5 h-5" />}
          tendencia="↑ 3 posições"
          cor="text-green-500"
        />
        <KpiCard
          titulo="Nível"
          valor={usuario.nivel || 'BRONZE'}
          icon={<Users className="w-5 h-5" />}
          cor="text-blue-500"
        />
        <KpiCard
          titulo="Vendas Mês"
          valor="0"
          icon={<TrendingUp className="w-5 h-5" />}
          cor="text-purple-500"
        />
      </div>

      {/* Campanhas e Cartelas (TODO) */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Suas Campanhas Ativas</h3>
        <p className="text-muted-foreground">Em desenvolvimento...</p>
      </div>
    </div>
  );
}

/**
 * Dashboard do Gerente
 */
function DashboardGerente({ usuario, dados }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Dashboard Gerente</h3>
        <p className="text-muted-foreground">Em desenvolvimento...</p>
      </div>
    </div>
  );
}

/**
 * Dashboard do Admin
 */
function DashboardAdmin({ usuario, dados }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Dashboard Admin</h3>
        <p className="text-muted-foreground">Em desenvolvimento...</p>
      </div>
    </div>
  );
}

/**
 * Componente reutilizável de KPI Card
 */
function KpiCard({ titulo, valor, icon, tendencia, cor }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-card rounded-lg border border-border p-4 md:p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{titulo}</span>
        <div className={`${cor}`}>{icon}</div>
      </div>
      <div className="text-2xl md:text-3xl font-bold mb-1">{valor}</div>
      {tendencia && (
        <div className="text-xs text-green-500 font-medium">{tendencia}</div>
      )}
    </motion.div>
  );
}
