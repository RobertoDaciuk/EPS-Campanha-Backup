/**
 * ============================================================================
 * DASHBOARD SERVICE - Lógica de Negócio (Corrigido)
 * ============================================================================
 *
 * Propósito:
 * Serviço responsável por agregar e calcular os Key Performance Indicators (KPIs)
 * para os dashboards de cada perfil de usuário (Admin, Gerente, VENDEDOR).
 *
 * CORREÇÃO (Erro KpisGerente.tsx):
 * - Reforçada a sanitização de saída no `getKpisGerente`. A agregação
 * `_sum` pode retornar `null`. Garantimos que `totalMoedinhasTime`
 * seja `0` se a agregação falhar ou for nula.
 *
 * CORREÇÃO (Pendente - Q.I. 170):
 * - Corrigida a tipagem de `posicaoRankingResult` no `getKpisVendedor`.
 * O cast `(posicaoRankingResult as PosicaoRanking[])` estava incorreto e
 * foi removido; o tipo de `posicaoRanking` foi ajustado para `bigint`.
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
   *
   * @param usuarioId - O ID do gerente autenticado.
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
      // KPI 3: Comissão pendente
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
      // KPI 4: Total de moedinhas da equipe
      this.prisma.usuario.aggregate({
        _sum: {
          rankingMoedinhas: true,
        },
        where: {
          gerenteId: usuarioId,
        },
      }),
    ]);

    // CORREÇÃO: Garantia explícita de que os valores são numéricos
    return {
      totalVendedores: totalVendedores ?? 0,
      vendasTimeAnalise: vendasTimeAnalise ?? 0,
      comissaoPendente: comissaoPendente._sum.valor?.toNumber() ?? 0,
      totalMoedinhasTime: totalMoedinhasTime._sum.rankingMoedinhas ?? 0,
    };
  }

  /**
   * Obtém os KPIs agregados para o dashboard do VENDEDOR.
   *
   * @param usuarioId - O ID do vendedor autenticado.
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

    // CORREÇÃO (Q.I. 170): O resultado de $queryRaw é um array.
    // O resultado de ROW_NUMBER() é um BigInt (posicao: bigint).
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