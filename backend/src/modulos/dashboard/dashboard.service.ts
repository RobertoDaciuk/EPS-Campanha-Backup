/**
 * ============================================================================
 * DASHBOARD SERVICE - Lógica de Negócio (Corrigido)
 * ============================================================================
 *
 * Propósito:
 * Serviço responsável por agregar e calcular os Key Performance Indicators (KPIs)
 * para os dashboards de cada perfil de usuário (Admin, Gerente, VENDEDOR).
 *
 * CORREÇÃO (Q.I. 170 - Consistência de Tipagem):
 * - Adicionada conversão explícita para Number em `totalMoedinhasTime`
 * no `getKpisGerente` para garantir que o resultado da agregação (que pode
 * ser BigInt no PostgreSQL) seja serializado corretamente no JSON de saída.
 *
 * CORREÇÃO (Anterior):
 * - Reforçada a sanitização de saída no `getKpisGerente`. A agregação
 * `_sum` pode retornar `null`. Garantimos que `totalMoedinhasTime`
 * seja `0` se a agregação falhar ou for nula.
 * - Corrigida a tipagem de `posicaoRankingResult` no `getKpisVendedor`.
 * O resultado de `$queryRaw` é tratado como BigInt e convertido para Number.
 *
 * @module DashboardModule
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PapelUsuario, Prisma, StatusUsuario } from '@prisma/client';

/**
 * Interface para a resposta do KPI de Posição no Ranking.
 * Prisma $queryRaw retorna BigInt para COUNT/ROW_NUMBER no PostgreSQL.
 */
interface PosicaoRanking {
  posicao: bigint;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém os KPIs agregados para o dashboard do ADMIN.
   * * Usa $transaction para garantir atomicidade (Princípio 5.1).
   */
  async getKpisAdmin() {
    const [
      usuariosPendentes,
      vendasEmAnalise,
      resgatesSolicitados,
      oticasAtivas,
    ] = await this.prisma.$transaction([
      this.prisma.usuario.count({
        where: { status: 'PENDENTE' },
      }),
      this.prisma.envioVenda.count({
        where: { status: 'EM_ANALISE' },
      }),
      this.prisma.resgatePremio.count({
        where: { status: 'SOLICITADO' },
      }),
      this.prisma.optica.count({
        where: { ativa: true },
      }),
    ]);

    return {
      usuariosPendentes,
      vendasEmAnalise,
      resgatesSolicitados,
      oticasAtivas,
    };
  }

  /**
   * Obtém os KPIs agregados para o dashboard do GERENTE.
   * * Usa $transaction para garantir atomicidade (Princípio 5.1).
   * @param usuarioId - O ID do gerente autenticado (Princípio 5.5).
   */
  async getKpisGerente(usuarioId: string) {
    const [
      totalVendedores,
      vendasTimeAnalise,
      comissaoPendente,
      totalMoedinhasTime,
    ] = await this.prisma.$transaction([
      // KPI 1: Total de vendedores
      this.prisma.usuario.count({
        where: { gerenteId: usuarioId },
      }),
      // KPI 2: Vendas da equipe em análise
      this.prisma.envioVenda.count({
        where: {
          vendedor: {
            gerenteId: usuarioId,
          },
          status: 'EM_ANALISE',
        },
      }),
      // KPI 3: Comissão pendente (Decimal)
      this.prisma.relatorioFinanceiro.aggregate({
        _sum: {
          valor: true,
        },
        where: {
          usuarioId: usuarioId,
          tipo: 'GERENTE',
          status: 'PENDENTE',
        },
      }),
      // KPI 4: Total de moedinhas da equipe (Int/BigInt)
      this.prisma.usuario.aggregate({
        _sum: {
          rankingMoedinhas: true,
        },
        where: {
          gerenteId: usuarioId,
        },
      }),
    ]);

    // CORREÇÃO: Garantia explícita de que os valores são numéricos e tratados (Princípio 1)
    return {
      totalVendedores: totalVendedores ?? 0,
      vendasTimeAnalise: vendasTimeAnalise ?? 0,
      // Converte Decimal para Number
      comissaoPendente: comissaoPendente._sum.valor?.toNumber() ?? 0,
      // Converte resultado de agregação (potencialmente BigInt) para Number
      totalMoedinhasTime: Number(totalMoedinhasTime._sum.rankingMoedinhas ?? 0),
    };
  }

  /**
   * Obtém os KPIs agregados para o dashboard do VENDEDOR.
   * * Usa $transaction para garantir atomicidade (Princípio 5.1).
   * @param usuarioId - O ID do vendedor autenticado (Princípio 5.5).
   */
  async getKpisVendedor(usuarioId: string) {
    const [
      usuario,
      vendasAprovadas,
      cartelasCompletas,
      posicaoRankingResult,
    ] = await this.prisma.$transaction([
      // KPI 1 e 2: Saldo e Ranking de Moedinhas
      this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          saldoMoedinhas: true,
          rankingMoedinhas: true,
          nivel: true,
        },
      }),
      // KPI 3: Total de vendas validadas
      this.prisma.envioVenda.count({
        where: {
          vendedorId: usuarioId,
          status: 'VALIDADO',
        },
      }),
      // KPI 4: Total de cartelas concluídas
      this.prisma.cartelaConcluida.count({
        where: { vendedorId: usuarioId },
      }),
      // KPI 5: Posição no Ranking (Sintaxe de interpolação correta)
      this.prisma.$queryRaw<PosicaoRanking[]>(
        Prisma.sql`
          WITH Ranking AS (
            SELECT
              id,
              "rankingMoedinhas",
              ROW_NUMBER() OVER (ORDER BY "rankingMoedinhas" DESC, "criadoEm" ASC) as posicao
            FROM
              "usuarios"
            WHERE
              papel = ${PapelUsuario.VENDEDOR}::"PapelUsuario"
              AND status = ${StatusUsuario.ATIVO}::"StatusUsuario"
          )
          SELECT
            posicao
          FROM
            Ranking
          WHERE
            id = ${usuarioId}
        `,
      ),
    ]);

    // O resultado de ROW_NUMBER() é um BigInt (posicao: bigint) e precisa ser convertido.
    const posicaoRanking =
      posicaoRankingResult.length > 0
        ? Number(posicaoRankingResult[0].posicao)
        : 0;

    return {
      saldoMoedinhas: usuario?.saldoMoedinhas ?? 0,
      rankingMoedinhas: usuario?.rankingMoedinhas ?? 0,
      nivel: usuario?.nivel ?? 'BRONZE',
      vendasAprovadas: vendasAprovadas ?? 0,
      cartelasCompletas: cartelasCompletas ?? 0,
      posicaoRanking,
    };
  }
}