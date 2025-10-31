import { Controller, Get, Query, UseGuards, Req, Logger } from '@nestjs/common';
import { JwtAuthGuard } from './../comum/guards/jwt-auth.guard';
import { PapeisGuard } from './../comum/guards/papeis.guard';
import { Papeis } from './../comum/decorators/papeis.decorator';
import { RankingService } from './ranking.service';
import { PaginacaoRankingDto } from './dto/paginacao-ranking.dto';

/**
 * Controlador com endpoint(s) seguro(s) para consulta do ranking global.
 *
 * ATUALIZADO (Sprint 17 - Tarefa 43):
 * - Adicionado endpoint /por-filial para Gerentes de Matriz
 */
@UseGuards(JwtAuthGuard)
@Controller('ranking')
export class RankingController {
  private readonly logger = new Logger(RankingController.name);

  constructor(private readonly rankingService: RankingService) {}

  /**
   * Endpoint de ranking geral global com paginação e critério de desempate.
   */
  @Get('geral')
  async getRankingGeral(@Query() paginacaoDto: PaginacaoRankingDto) {
    return this.rankingService.getRankingGeralPaginado(paginacaoDto);
  }

  /**
   * Endpoint de ranking agrupado por filial para Gerentes de Matriz.
   *
   * NOVO (Sprint 17 - Tarefa 43):
   * - Rota: GET /api/ranking/por-filial
   * - Acesso: Apenas GERENTE
   * - Retorna ranking separado da Matriz e de cada Filial
   *
   * @param req - Request com dados do usuário (injetado por JwtAuthGuard)
   * @returns Ranking agrupado (matriz + filiais)
   *
   * @example
   * ```
   * GET /api/ranking/por-filial
   * Authorization: Bearer <token-gerente-matriz>
   * ```
   *
   * Resposta (200):
   * ```
   * {
   *   "matriz": {
   *     "id": "uuid-matriz",
   *     "nome": "Ótica Matriz Principal",
   *     "ranking": [
   *       { "id": "uuid-vendedor-1", "nome": "João", "rankingMoedinhas": 5000, ... },
   *       ...
   *     ]
   *   },
   *   "filiais": [
   *     {
   *       "id": "uuid-filial-1",
   *       "nome": "Ótica Filial Norte",
   *       "ranking": [...]
   *     },
   *     ...
   *   ]
   * }
   * ```
   */
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis('GERENTE')
  @Get('por-filial')
  async getRankingPorFilial(@Req() req) {
    const usuario = req.user;
    this.logger.log(
      `[GET /por-filial] [GERENTE] Solicitado por: ${usuario.id} (${usuario.email})`,
    );
    return this.rankingService.getRankingFiliaisParaMatriz(usuario.id);
  }
}
