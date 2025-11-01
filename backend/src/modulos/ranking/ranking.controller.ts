/**
 * ============================================================================
 * RANKING CONTROLLER (REFATORADO - RBAC Customizado)
 * ============================================================================
 *
 * Propósito:
 * Controlador com endpoint(s) seguro(s) para consulta do ranking global e por filial.
 *
 * REFATORAÇÃO (Q.I. 170 - RBAC Customizado):
 * - Rota `/por-filial` agora utiliza o `GerenteMatrizGuard` em vez do
 * `PapeisGuard` padrão com restrição apenas a 'GERENTE'.
 * - O novo Guard encapsula a regra de negócio "é GERENTE E é MATRIZ".
 *
 * @module RankingModule
 * ============================================================================
 */
import { Controller, Get, Query, UseGuards, Req, Logger } from '@nestjs/common';
import { JwtAuthGuard } from './../comum/guards/jwt-auth.guard';
import { PapeisGuard } from './../comum/guards/papeis.guard';
import { Papeis } from './../comum/decorators/papeis.decorator';
import { RankingService } from './ranking.service';
import { PaginacaoRankingDto } from './dto/paginacao-ranking.dto';
import { GerenteMatrizGuard } from './guards/gerente-matriz.guard'; // Importado

/**
 * Aplica o Guard de autenticação JWT globalmente para este controller.
 */
@UseGuards(JwtAuthGuard) 
@Controller('ranking')
export class RankingController {
  private readonly logger = new Logger(RankingController.name);

  constructor(private readonly rankingService: RankingService) {}

  /**
   * Endpoint de ranking geral global com paginação e critério de desempate.
   * * Requer apenas JWT válido (JwtAuthGuard).
   */
  @Get('geral')
  async getRankingGeral(@Query() paginacaoDto: PaginacaoRankingDto) {
    // O service agora lida com os defaults do DTO
    return this.rankingService.getRankingGeralPaginado(paginacaoDto);
  }

  /**
   * Endpoint de ranking agrupado por filial para Gerentes de Matriz.
   *
   * @param req - Request com dados do usuário (injetado por JwtAuthGuard)
   * @returns Ranking agrupado (matriz + filiais)
   * @throws ForbiddenException - Se não for Gerente OU não for Matriz (tratado pelo GerenteMatrizGuard).
   */
  @UseGuards(GerenteMatrizGuard) // Novo Guard que valida (papel == GERENTE) E (ótica.ehMatriz == true)
  @Get('por-filial')
  async getRankingPorFilial(@Req() req) {
    const usuario = req.user;
    this.logger.log(
      `[GET /por-filial] [GERENTE MATRIZ] Solicitado por: ${usuario.id} (${usuario.email})`,
    );
    // O service ainda é responsável pela lógica de negócio e validação de fallback
    return this.rankingService.getRankingFiliaisParaMatriz(usuario.id);
  }
}