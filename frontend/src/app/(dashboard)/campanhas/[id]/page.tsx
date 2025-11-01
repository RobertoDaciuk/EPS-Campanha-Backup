/**
 * ============================================================================
 * CAMPANHA DETALHES PAGE (CORRIGIDO - Lógica Crítica de Spillover)
 * ============================================================================
 *
 * Propósito:
 * Página de Detalhes da Campanha com Tabs de Cartelas
 *
 * CORREÇÃO (Q.I. 170 - Lógica de Spillover):
 * - REESCRITO: O `getEnviosValidadosContagem` agora conta TODOS os envios
 * VALIDADO para o requisito lógico (agrupado por ORDEM), ignorando o campo
 * `numeroCartelaAtendida`.
 * - MOTIVO: O progresso (COMPLETO) é determinado pelo total de envios da ORDEM,
 * e não por quantos caíram na cartela ATUAL. O `numeroCartelaAtendida` é apenas
 * uma marcação para o spillover.
 *
 * CORREÇÃO (Estrutura/Importação):
 * - Corrigida a importação do Contexto de Autenticação.
 *
 * @module Campanhas
 * ============================================================================
 */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Loader2, AlertCircle, Trophy, Target, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import RequisitoCard from "@/components/campanhas/RequisitoCard";
import TabsCampanha from "@/components/campanhas/TabsCampanha";
// CORRIGIDO: Usar alias e nome de contexto correto
import { useAuth } from "@/contexts/ContextoAutenticacao";

/**
 * ============================================================================
 * TIPOS E INTERFACES
 * ============================================================================
 */

/**
 * Tipo para o status calculado de um requisito em uma cartela específica
 */
type StatusRequisito = "ATIVO" | "COMPLETO" | "BLOQUEADO";

/**
 * Interface para Condição de um Requisito
 */
interface Condicao {
  id: string;
  campo: string;
  operador: string;
  valor: string;
  requisitoId: string;
}

/**
 * Interface para Requisito de uma Cartela
 */
interface Requisito {
  id: string;
  descricao: string;
  quantidade: number;
  tipoUnidade: string;
  ordem: number;
  condicoes: Condicao[];
  regraCartela: {
    numeroCartela: number;
  };
}

/**
 * Interface para Cartela da Campanha
 */
interface Cartela {
  id: string;
  numeroCartela: number;
  descricao: string;
  requisitos: Requisito[];
}

/**
 * Interface para Campanha Completa
 */
interface Campanha {
  id: string;
  titulo: string; // ✅ CORRIGIDO: Backend usa "titulo"
  descricao: string;
  dataInicio: string;
  dataFim: string;
  status: "RASCUNHO" | "ATIVA" | "ENCERRADA";
  cartelas: Cartela[];
}

/**
 * Interface para Envio de Venda (Histórico do Vendedor)
 */
interface EnvioVenda {
  id: string;
  numeroPedido: string;
  status: "EM_ANALISE" | "VALIDADO" | "REJEITADO" | "CONFLITO_MANUAL";
  dataEnvio: string;
  dataValidacao: string | null;
  motivoRejeicao: string | null;
  requisitoId: string;
  numeroCartelaAtendida: number | null;
}

/**
 * ============================================================================
 * COMPONENTE PRINCIPAL: CampanhaDetalhesPage
 * ============================================================================
 */
export default function CampanhaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const campanhaId = params.id as string;

  // ========================================
  // CONTEXTO: Autenticação
  // ========================================
  const { estaAutenticado, carregando: isAuthLoading } = useAuth(); // Corrigido 'carregando'

  // ========================================
  // ESTADO: Dados e Loading
  // ========================================
  const [campanha, setCampanha] = useState<Campanha | null>(null);
  const [meusEnvios, setMeusEnvios] = useState<EnvioVenda[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FUNÇÃO: Buscar Dados da Campanha
  // ========================================
  const buscarDadosCampanha = useCallback(async () => {
    // GUARD: Não faz chamadas se não estiver autenticado
    if (!estaAutenticado) {
      console.warn("buscarDadosCampanha: Usuário não autenticado. Abortando chamada API.");
      return;
    }

    try {
      setIsLoadingData(true);
      setError(null);

      // Buscar dados da campanha
      const responseCampanha = await api.get(`/campanhas/${campanhaId}`);
      const dadosCampanha = responseCampanha.data;

      // Buscar envios do vendedor autenticado para esta campanha
      const responseEnvios = await api.get(
        `/envios-venda/minhas?campanhaId=${campanhaId}`
      );
      const dadosEnvios = responseEnvios.data;

      // Atualizar estados
      setCampanha(dadosCampanha);
      setMeusEnvios(dadosEnvios);
    } catch (err: any) {
      console.error("Erro ao buscar dados da campanha:", err);

      // Tratamento de erro de autenticação
      if (err.response?.status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
        router.push("/login");
        return;
      }

      // Tratamento de outros erros
      const mensagemErro =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erro ao carregar dados da campanha.";
      setError(mensagemErro);
      toast.error(mensagemErro);
    } finally {
      setIsLoadingData(false);
    }
  }, [estaAutenticado, campanhaId, router]);

  // ========================================
  // EFEITO: Buscar Dados ao Montar
  // ========================================
  useEffect(() => {
    // Aguarda AuthProvider terminar de carregar
    if (isAuthLoading) {
      console.log("useEffect: Aguardando AuthProvider terminar de carregar...");
      return;
    }

    // Se não está autenticado após loading, redireciona
    if (!estaAutenticado) {
      console.warn("useEffect: Usuário não autenticado. Redirecionando para login...");
      toast.error("Você precisa estar autenticado para acessar esta página.");
      router.push("/login");
      return;
    }

    // Se está autenticado e tem campanhaId, busca dados
    if (estaAutenticado && campanhaId) {
      console.log("useEffect: Usuário autenticado. Buscando dados da campanha...");
      buscarDadosCampanha();
    }
  }, [isAuthLoading, estaAutenticado, campanhaId, buscarDadosCampanha, router]);

  // ========================================
  // CALLBACK: Refetch Após Submissão
  // ========================================
  const handleSubmissaoSucesso = () => {
    buscarDadosCampanha();
  };

  // ========================================
  // MEMO: Mapa de Requisitos Relacionados por Ordem (CRÍTICO SPILLOVER)
  // ========================================
  /**
   * Cria mapa que agrupa todos os IDs de requisitos pela mesma ordem.
   * Chave: `ordem` (number)
   * Valor: Array de IDs de requisitos com essa ordem
   * (Usado para contar o progresso total e filtrar envios).
   */
  const mapaRequisitosRelacionados = useMemo(() => {
    if (!campanha) return new Map<number, string[]>();

    const mapa = new Map<number, string[]>();

    for (const cartela of campanha.cartelas) {
      for (const requisito of cartela.requisitos) {
        const idsExistentes = mapa.get(requisito.ordem) || [];
        mapa.set(requisito.ordem, [...idsExistentes, requisito.id]);
      }
    }

    return mapa;
  }, [campanha]);

  // ========================================
  // MEMO: Cálculo de Status (ATIVO, COMPLETO, BLOQUEADO)
  // ========================================
  /**
   * Calcula o status preciso de cada instância de requisito em cada cartela.
   *
   * Estrutura do Mapa:
   * - Chave: `${requisitoId}-${numeroCartela}`
   * - Valor: 'ATIVO' | 'COMPLETO' | 'BLOQUEADO'
   */
  const mapaStatusRequisitos = useMemo(() => {
    if (!campanha || !meusEnvios) {
      return new Map<string, StatusRequisito>();
    }

    const mapaStatus = new Map<string, StatusRequisito>();

    // -----------------------------------------------------------------------
    // HELPER: Contagem de Envios Validados Totais por Ordem (CORREÇÃO CRÍTICA)
    // -----------------------------------------------------------------------
    /**
     * Retorna a contagem de envios VALIDADO para um requisito lógico (ORDEM),
     * somando o progresso de TODAS as cartelas.
     *
     * CORREÇÃO SPILLOVER (Princípio 1):
     * - Conta envios VALIDADO de QUALQUER requisito com a mesma ordem (`idsRelacionados`).
     * - IGNORA `numeroCartelaAtendida`, pois a contagem total deve ser absoluta
     * para determinar o status COMPLETO do requisito lógico.
     *
     * @param requisito - Objeto Requisito completo (com ordem)
     * @returns Contagem de envios VALIDADO total
     */
    const getEnviosValidadosContagemTotal = (requisito: Requisito): number => {
      // Busca todos os IDs de requisitos relacionados (mesma ordem)
      const idsRelacionados = mapaRequisitosRelacionados.get(requisito.ordem) || [requisito.id];

      return meusEnvios.filter(
        (envio) =>
          envio.status === "VALIDADO" &&
          idsRelacionados.includes(envio.requisitoId) // Filtra por ID de requisito (que carrega a ordem)
      ).length;
    };

    // -----------------------------------------------------------------------
    // LOOP 1: Calcular Requisitos COMPLETOS
    // -----------------------------------------------------------------------
    for (const cartela of campanha.cartelas) {
      for (const requisito of cartela.requisitos) {
        // Usa a contagem TOTAL para determinar se o requisito lógico está COMPLETO
        const countValidadosTotal = getEnviosValidadosContagemTotal(requisito);
        const isCompleto = countValidadosTotal >= requisito.quantidade;

        if (isCompleto) {
          mapaStatus.set(
            `${requisito.id}-${cartela.numeroCartela}`,
            "COMPLETO"
          );
        }
      }
    }

    // -----------------------------------------------------------------------
    // LOOP 2: Calcular Requisitos BLOQUEADOS (Spillover)
    // -----------------------------------------------------------------------
    /**
     * Lógica de Bloqueio:
     * - Cartela N Req A é bloqueado se Cartela N-1 Req A não estiver COMPLETO
     */
    for (const cartela of campanha.cartelas) {
      if (cartela.numeroCartela <= 1) continue;

      const cartelaAnterior = campanha.cartelas.find(
        (c) => c.numeroCartela === cartela.numeroCartela - 1
      );

      if (!cartelaAnterior) continue; // Safety check

      for (const requisito of cartela.requisitos) {
        // Se já está COMPLETO, não precisa verificar bloqueio
        const chaveAtual = `${requisito.id}-${cartela.numeroCartela}`;
        if (mapaStatus.get(chaveAtual) === "COMPLETO") continue;

        // Encontrar requisito equivalente na cartela anterior pela ORDEM
        const requisitoAnterior = cartelaAnterior.requisitos.find(
          (r) => r.ordem === requisito.ordem
        );

        if (!requisitoAnterior) continue; // Safety check

        // Verificar se o requisito anterior está COMPLETO
        const chaveAnterior = `${requisitoAnterior.id}-${cartelaAnterior.numeroCartela}`;
        const isAnteriorCompleto = mapaStatus.get(chaveAnterior) === "COMPLETO";

        // Se não estiver completo, marca BLOQUEADO
        if (!isAnteriorCompleto) {
          mapaStatus.set(chaveAtual, "BLOQUEADO");
        }
      }
    }
    // Status implícito: Qualquer requisito não marcado é ATIVO
    return mapaStatus;
  }, [meusEnvios, campanha]);

  // ========================================
  // RENDERIZAÇÃO: Estados de Loading e Erro
  // ========================================

  /**
   * Loading State
   */
  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            {isAuthLoading ? "Verificando autenticação..." : "Carregando dados da campanha..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !campanha) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold text-destructive">
            Erro ao Carregar Campanha
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ||
              "A campanha que você está procurando não existe ou foi removida."}
          </p>
          <button
            onClick={() => router.push("/campanhas")}
            className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para Campanhas
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* ========================================
          HEADER: Título e Descrição da Campanha
          ======================================== */}
      <div className="mb-8">
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        {/* Título e Ícone */}
        <div className="mb-4 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{campanha.titulo}</h1>
        </div>

        {/* Descrição */}
        <p className="text-muted-foreground">{campanha.descricao}</p>
      </div>

      {/* ========================================
          VALIDAÇÃO: Campanha sem Cartelas
          ======================================== */}
      {campanha.cartelas.length === 0 && (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            Esta campanha ainda não possui cartelas cadastradas.
          </p>
        </div>
      )}

      {/* ========================================
          TABS: Navegação entre Cartelas
          ======================================== */}
      {campanha.cartelas.length > 0 && (
        <TabsCampanha cartelas={campanha.cartelas}>
          {(cartelaAtivaId) => {
            // -----------------------------------------------------------------------
            // LÓGICA: Encontrar Cartela Ativa pelo ID
            // -----------------------------------------------------------------------
            const cartelaAtual = campanha.cartelas.find(
              (c) => c.id === cartelaAtivaId
            );

            // -----------------------------------------------------------------------
            // VALIDAÇÃO: Cartela Não Encontrada
            // -----------------------------------------------------------------------
            if (!cartelaAtual) {
              return (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    Cartela não encontrada.
                  </p>
                </div>
              );
            }

            // -----------------------------------------------------------------------
            // RENDERIZAÇÃO: Conteúdo da Cartela Ativa
            // -----------------------------------------------------------------------
            return (
              <div className="space-y-6">
                {/* ========================================
                    VALIDAÇÃO: Cartela sem Requisitos
                    ======================================== */}
                {cartelaAtual.requisitos.length === 0 && (
                  <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">
                      Esta cartela ainda não possui requisitos cadastrados.
                    </p>
                  </div>
                )}

                {/* ========================================
                    LISTA DE REQUISITOS (CARDS)
                    ======================================== */}
                {cartelaAtual.requisitos.length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cartelaAtual.requisitos.map((requisito) => {
                      // -----------------------------------------------------------------------
                      // CÁLCULO: Obter Status do Requisito (ATIVO, COMPLETO, BLOQUEADO)
                      // -----------------------------------------------------------------------
                      const chave = `${requisito.id}-${cartelaAtual.numeroCartela}`;
                      const status =
                        mapaStatusRequisitos.get(chave) ?? "ATIVO";

                      return (
                        <RequisitoCard
                          key={requisito.id}
                          requisito={requisito}
                          campanhaId={campanhaId}
                          meusEnvios={meusEnvios}
                          onSubmissaoSucesso={handleSubmissaoSucesso}
                          status={status}
                          numeroCartelaAtual={cartelaAtual.numeroCartela}
                          idsRequisitosRelacionados={mapaRequisitosRelacionados.get(requisito.ordem) || [requisito.id]}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }}
        </TabsCampanha>
      )}
    </div>
  );
}