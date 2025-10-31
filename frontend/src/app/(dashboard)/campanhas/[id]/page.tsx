"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Loader2, AlertCircle, Trophy, Target, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import RequisitoCard from "@/components/campanhas/RequisitoCard";
import TabsCampanha from "@/components/campanhas/TabsCampanha";
import { useAuth } from "@/contexts/AuthContext";

/**
 * ============================================================================
 * TIPOS E INTERFACES
 * ============================================================================
 */

/**
 * Tipo para o status calculado de um requisito em uma cartela específica
 * (Sprint 16.5 - Tarefa 38.5)
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
 * (ATUALIZADO Sprint 16.5: Agora inclui regraCartela)
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
 * (CORRIGIDO Sprint 16.5: Campo correto é "titulo", não "nome")
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
 * (ATUALIZADO Sprint 16.5: Novo status CONFLITO_MANUAL)
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
 *
 * Página de Detalhes da Campanha com Tabs de Cartelas
 *
 * Funcionalidades:
 * - Busca dados completos da campanha (com cartelas e requisitos)
 * - Busca envios do vendedor autenticado para esta campanha
 * - Sistema de Tabs para navegar entre cartelas
 * - Renderização de RequisitoCard para cada requisito da cartela ativa
 * - Refetch de envios após submissão bem-sucedida
 * - Estados de loading e erro
 * - Proteção de autenticação (redirect se não autenticado)
 * - Cálculo de Status (ATIVO, COMPLETO, BLOQUEADO) por requisito/cartela (Sprint 16.5 - Tarefa 38.5)
 *
 * Refatorações Implementadas (Sprint 16.2):
 * - Busca de meusEnvios via GET /api/campanhas/:id/minhas
 * - Callback de refetch após submissão
 * - Props de meusEnvios passadas para RequisitoCard
 * - Cálculo de progresso delegado ao RequisitoCard
 *
 * Refatorações Implementadas (Sprint 16.5 - Tarefa 38.5):
 * - Cálculo de Status (ATIVO, COMPLETO, BLOQUEADO) usando useMemo
 * - Lógica de Spillover/Bloqueio entre cartelas
 * - Status passado como prop para RequisitoCard
 */
export default function CampanhaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const campanhaId = params.id as string;

  // ========================================
  // CONTEXTO: Autenticação (Sprint 16.5 - Correção 401)
  // ========================================
  const { estaAutenticado, isLoading: isAuthLoading } = useAuth();

  // ========================================
  // ESTADO: Dados e Loading
  // ========================================
  const [campanha, setCampanha] = useState<Campanha | null>(null);
  const [meusEnvios, setMeusEnvios] = useState<EnvioVenda[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FUNÇÃO: Buscar Dados da Campanha (Refatorado - Sprint 16.5)
  // ========================================
  /**
   * Busca dados completos da campanha e envios do vendedor autenticado.
   *
   * Fluxo (ATUALIZADO Sprint 16.5 - Correção 401):
   * 1. Verifica se o usuário está autenticado (segurança extra)
   * 2. GET /api/campanhas/:id (dados da campanha)
   * 3. GET /api/envios-venda/minhas?campanhaId=:id (envios do vendedor autenticado)
   * 4. Atualiza estados (campanha, meusEnvios, loading, error)
   * 5. Redireciona para login se não autenticado (401)
   *
   * IMPORTANTE: Agora usa useCallback e verifica estaAutenticado antes de fazer chamadas API
   */
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
  // EFEITO: Buscar Dados ao Montar (Refatorado - Sprint 16.5)
  // ========================================
  /**
   * Dispara busca de dados APENAS quando:
   * 1. AuthProvider terminou de carregar (!isAuthLoading)
   * 2. Usuário está autenticado (estaAutenticado)
   * 3. campanhaId está disponível
   *
   * CORREÇÃO 401: Previne chamadas API antes da autenticação estar 100% pronta
   */
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
  /**
   * Callback passado para RequisitoCard.
   * Dispara refetch dos envios após submissão bem-sucedida.
   */
  const handleSubmissaoSucesso = () => {
    buscarDadosCampanha();
  };

  // ========================================
  // MEMO: Mapa de Requisitos Relacionados por Ordem (CORREÇÃO SPILLOVER)
  // ========================================
  /**
   * PROBLEMA IDENTIFICADO:
   * - Requisitos de cartelas diferentes têm IDs DIFERENTES (uuid-1a vs uuid-2a)
   * - Envios apontam para o requisitoId da PRIMEIRA cartela (uuid-1a)
   * - Filtro por requisitoId não encontra spillover na Cartela 2
   *
   * SOLUÇÃO:
   * - Criar mapa que agrupa todos os IDs de requisitos pela mesma ordem
   * - Exemplo: Requisito "Lentes" (ordem 1) tem IDs [uuid-1a, uuid-2a, uuid-3a]
   * - Filtrar envios usando QUALQUER desses IDs
   *
   * Estrutura do Mapa:
   * - Chave: `ordem-${ordem}`
   * - Valor: Array de IDs de requisitos com essa ordem
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
   * Lógica (Sprint 16.5 - Tarefa 38.5):
   * 1. Loop 1 (Completos): Marca requisitos com envios VALIDADO suficientes como COMPLETO
   * 2. Loop 2 (Bloqueados): Marca requisitos de cartelas > 1 como BLOQUEADO se o requisito anterior não estiver COMPLETO
   * 3. Status implícito: Qualquer requisito não marcado é considerado ATIVO
   *
   * Estrutura do Mapa:
   * - Chave: `${requisitoId}-${numeroCartela}`
   * - Valor: 'ATIVO' | 'COMPLETO' | 'BLOQUEADO'
   *
   * CORREÇÃO SPILLOVER:
   * - Usa mapaRequisitosRelacionados para encontrar todos os IDs relacionados
   * - Conta envios VALIDADO de QUALQUER requisito com a mesma ordem
   *
   * Recalcula quando meusEnvios ou campanha mudam.
   */
  const mapaStatusRequisitos = useMemo(() => {
    // Guard: Se não houver dados, retorna mapa vazio
    if (!campanha || !meusEnvios) {
      return new Map<string, StatusRequisito>();
    }

    const mapaStatus = new Map<string, StatusRequisito>();

    // -----------------------------------------------------------------------
    // HELPER: Contagem de Envios Validados para Requisito/Cartela (CORRIGIDO)
    // -----------------------------------------------------------------------
    /**
     * Retorna a contagem de envios VALIDADO para um requisito específico
     * em uma cartela específica.
     *
     * CORREÇÃO SPILLOVER:
     * - Busca TODOS os IDs de requisitos com a mesma ordem (uuid-1a, uuid-2a, uuid-3a)
     * - Conta envios que apontam para QUALQUER desses IDs
     * - Filtra por numeroCartelaAtendida para a cartela específica
     *
     * @param requisito - Objeto Requisito completo (com ordem)
     * @param numCartela - Número da cartela
     * @returns Contagem de envios VALIDADO
     */
    const getEnviosValidadosContagem = (
      requisito: Requisito,
      numCartela: number
    ): number => {
      // Busca todos os IDs de requisitos relacionados (mesma ordem)
      const idsRelacionados = mapaRequisitosRelacionados.get(requisito.ordem) || [requisito.id];

      return meusEnvios.filter(
        (envio) =>
          envio.status === "VALIDADO" &&
          idsRelacionados.includes(envio.requisitoId) && // ✅ CORRIGIDO: Busca em TODOS os IDs
          envio.numeroCartelaAtendida === numCartela
      ).length;
    };

    // -----------------------------------------------------------------------
    // LOOP 1: Calcular Requisitos COMPLETOS
    // -----------------------------------------------------------------------
    /**
     * Itera por todas as cartelas e requisitos.
     * Se um requisito atingiu a quantidade necessária de validados,
     * marca como COMPLETO no mapa.
     */
    for (const cartela of campanha.cartelas) {
      for (const requisito of cartela.requisitos) {
        const countValidados = getEnviosValidadosContagem(
          requisito, // ✅ CORRIGIDO: Passa objeto completo
          cartela.numeroCartela
        );
        const isCompleto = countValidados >= requisito.quantidade;

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
     * Itera por cartelas > 1 (cartelas subsequentes).
     * Para cada requisito que NÃO está COMPLETO,
     * verifica se o requisito equivalente na cartela anterior está COMPLETO.
     * Se não estiver, marca como BLOQUEADO.
     *
     * Lógica de Bloqueio:
     * - Cartela 2 Req A é bloqueado se Cartela 1 Req A não estiver COMPLETO
     * - Cartela 3 Req B é bloqueado se Cartela 2 Req B não estiver COMPLETO
     */
    for (const cartela of campanha.cartelas) {
      // Pula cartela 1 (não pode ser bloqueada)
      if (cartela.numeroCartela <= 1) continue;

      // Buscar cartela anterior
      const cartelaAnterior = campanha.cartelas.find(
        (c) => c.numeroCartela === cartela.numeroCartela - 1
      );

      if (!cartelaAnterior) continue; // Safety check

      for (const requisito of cartela.requisitos) {
        // Se já está COMPLETO, não precisa verificar bloqueio
        const chaveAtual = `${requisito.id}-${cartela.numeroCartela}`;
        if (mapaStatus.get(chaveAtual) === "COMPLETO") continue;

        // Encontrar requisito equivalente na cartela anterior
        // Assumindo que requisitos mantêm a mesma ordem entre cartelas
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

    // -----------------------------------------------------------------------
    // STATUS IMPLÍCITO: Qualquer requisito não marcado é ATIVO
    // -----------------------------------------------------------------------
    // Não é necessário adicionar explicitamente, pois o getter retornará 'ATIVO' como default

    return mapaStatus;
  }, [meusEnvios, campanha]);

  // ========================================
  // RENDERIZAÇÃO: Estados de Loading e Erro (Refatorado - Sprint 16.5)
  // ========================================

  /**
   * Loading State: Mostra spinner enquanto:
   * - AuthProvider está carregando (isAuthLoading)
   * - OU dados da campanha estão sendo buscados (isLoadingData)
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
          HEADER: Botão Voltar, Título e Descrição da Campanha
          (Atualizado Sprint 16.5 - Correção de Bug: Botão Voltar Adicionado)
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
          TABS: Navegação entre Cartelas (CORRIGIDO)
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
