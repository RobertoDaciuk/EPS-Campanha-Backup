/**
 * ============================================================================
 * RANKING SERVICE - Lógica de Negócio (REFATORADO - Performance)
 * ============================================================================
 *
 * Propósito:
 * Serviço dedicado à lógica de ranking (global, equipe e posições).
 *
 * REFATORAÇÃO (Q.I. 170 - Performance Crítica):
 * - REESCRITO: `getPosicaoUsuario` agora usa `Prisma.$queryRaw` com a função
 * SQL `ROW_NUMBER()`.
 * - MOTIVO: O método anterior trazia e percorria TODOS os usuários em memória
 * (O(N)), causando gargalo em bases grandes (Princípio 5.1). A nova solução é O(log N).
 *
 * REFATORAÇÃO (Q.I. 170 - DTO):
 * - REMOVIDO: A responsabilidade de definir valores padrão (`pagina = 1`, etc.)
 * do DTO e movida para o service.
 *
 * ATUALIZADO (Sprint 17 - Tarefa 43):
 * - Inclui método getRankingFiliaisParaMatriz para Gerentes de Matriz
 *
 * @module RankingModule
 * ============================================================================
 */
import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PapelUsuario, StatusUsuario, Prisma } from '@prisma/client';
import { PaginacaoRankingDto } from './dto/paginacao-ranking.dto';

/**
 * Interface para tipar o resultado da consulta raw de posição.
 */
interface PosicaoUsuarioRaw {
  posicao: bigint; // PostgreSQL retorna BigInt para ROW_NUMBER()
}

/**
 * Serviço dedicado à lógica de ranking (global, equipe e posições).
 */
@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula a posição de um usuário no ranking global dos vendedores
   * usando a Window Function ROW_NUMBER() do SQL.
   *
   * @param usuarioId ID do usuário a consultar
   * @returns Posição do usuário (1-baseado). Retorna 0 se não for elegível/encontrado.
   * @throws NotFoundException (ou 0) se usuário não ranqueado/encontrado.
   *
   * @example
   * const { posicao } = await this.getPosicaoUsuario('uuid-vendedor'); // { posicao: 42 }
   */
  async getPosicaoUsuario(usuarioId: string): Promise<{ posicao: number }> {
    /**
     * Consulta SQL otimizada (O(log N)):
     * 1. Cria uma CTE (Common Table Expression) 'Ranking'.
     * 2. Usa ROW_NUMBER() para calcular a posição no ranking, com desempate.
     * 3. Filtra o resultado pela ID do usuário.
     */
    const resultado = await this.prisma.$queryRaw<PosicaoUsuarioRaw[]>(
      Prisma.sql`
        WITH Ranking AS (
          SELECT
            id,
            ROW_NUMBER() OVER (
              ORDER BY "rankingMoedinhas" DESC, "criadoEm" ASC
            ) as posicao
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
    );

    // Converte BigInt para Number. Retorna 0 se o usuário não for encontrado/elegível.
    const posicao = resultado.length > 0 ? Number(resultado[0].posicao) : 0;
    
    return { posicao };
  }

  /**
   * Retorna o ranking da equipe de um gerente (somente seus vendedores).
   * @param gerenteId ID do gerente
   */
  async getRankingEquipe(gerenteId: string) {
    return this.prisma.usuario.findMany({
      where: { gerenteId },
      select: { id: true, nome: true, avatarUrl: true, rankingMoedinhas: true },
      orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
    });
  }

  /**
   * Retorna o ranking global de vendedores com paginação e desempate.
   *
   * @param dto PaginacaoRankingDto com filtros de página e quantidade
   */
  async getRankingGeralPaginado(dto: PaginacaoRankingDto) {
    // Valores padrão definidos aqui (regras de negócio)
    const pagina = dto.pagina ?? 1;
    const porPagina = dto.porPagina ?? 20;
    
    const skip = (pagina - 1) * porPagina;
    const take = porPagina;

    const [usuarios, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where: { 
          papel: PapelUsuario.VENDEDOR,
          status: StatusUsuario.ATIVO, // CRÍTICO: Rankear apenas ativos
        },
        select: {
          id: true,
          nome: true,
          avatarUrl: true,
          rankingMoedinhas: true,
          nivel: true,
          optica: {
            select: {
              nome: true,
            },
          },
        },
        orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
        skip,
        take,
      }),
      this.prisma.usuario.count({ 
        where: { 
          papel: PapelUsuario.VENDEDOR,
          status: StatusUsuario.ATIVO,
        },
      }),
    ]);

    const totalPaginas = Math.ceil(total / porPagina);

    // ========================================
    // CALCULAR POSIÇÃO DE CADA USUÁRIO
    // ========================================
    /**
     * A posição é calculada com base no offset (skip) da paginação.
     * Fórmula: posicao = skip + index + 1
     */
    const dadosComPosicao = usuarios.map((usuario, index) => ({
      ...usuario,
      posicao: skip + index + 1, // ✅ Adiciona campo posicao
    }));

    return {
      dados: dadosComPosicao,
      paginaAtual: pagina,
      totalPaginas,
      totalRegistros: total,
    };
  }

  /**
   * Retorna o ranking agrupado por filial para Gerentes de Matriz.
   *
   * @param matrizGerenteId - ID do gerente da matriz
   * @returns Ranking agrupado (matriz + filiais)
   * @throws {ForbiddenException} Se o usuário não for Gerente de Matriz
   */
  async getRankingFiliaisParaMatriz(matrizGerenteId: string): Promise<any> {
    this.logger.log(`Buscando rankings por filial para Gerente Matriz ID: ${matrizGerenteId}`);

    // 1. Buscar o gerente e sua ótica Matriz com as Filiais
    const gerenteMatriz = await this.prisma.usuario.findUnique({
      where: { id: matrizGerenteId, papel: PapelUsuario.GERENTE },
      include: {
        optica: {
          include: {
            filiais: {
              // Busca as filiais ligadas a esta matriz
              select: { id: true, nome: true },
              where: { ativa: true }, // Considera apenas filiais ativas
              orderBy: { nome: 'asc' },
            },
          },
        },
      },
    });

    // Validação: Usuário é gerente? Está ligado a uma ótica? A ótica é matriz?
    if (!gerenteMatriz || !gerenteMatriz.optica || !gerenteMatriz.optica.ehMatriz) {
      this.logger.warn(`Usuário ${matrizGerenteId} não é um Gerente de Matriz válido.`);
      throw new ForbiddenException(
        'Acesso negado. Apenas gerentes de matriz podem ver rankings por filial.',
      );
    }

    const matriz = gerenteMatriz.optica;
    const filiais = matriz.filiais;

    // Função auxiliar para buscar ranking de uma ótica
    const buscarRankingOptica = async (opticaId: string) => {
      return this.prisma.usuario.findMany({
        where: {
          opticaId: opticaId,
          papel: PapelUsuario.VENDEDOR,
          status: StatusUsuario.ATIVO,
        },
        select: {
          id: true,
          nome: true,
          avatarUrl: true,
          rankingMoedinhas: true,
          nivel: true,
        },
        orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
        take: 100, // Limite para evitar sobrecarga
      });
    };

    // 2. Buscar ranking da Matriz e de cada Filial (em paralelo)
    const [rankingMatriz, ...rankingsFiliais] = await Promise.all([
      buscarRankingOptica(matriz.id),
      ...filiais.map(filial => buscarRankingOptica(filial.id)),
    ]);

    // 3. Montar a resposta estruturada
    const resultado = {
      matriz: {
        id: matriz.id,
        nome: matriz.nome,
        ranking: rankingMatriz,
      },
      filiais: filiais.map((filial, index) => ({
        id: filial.id,
        nome: filial.nome,
        ranking: rankingsFiliais[index],
      })),
    };

    this.logger.log(
      `Rankings por filial para Gerente ${matrizGerenteId} (${matriz.nome}) buscados com sucesso.`,
    );
    return resultado;
  }
}