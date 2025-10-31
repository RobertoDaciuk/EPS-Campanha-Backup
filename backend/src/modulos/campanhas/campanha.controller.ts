/**
 * ============================================================================
 * CAMPANHA CONTROLLER - Rotas HTTP do Módulo de Campanhas
 * ============================================================================
 * 
 * Descrição:
 * Controlador responsável por expor rotas HTTP seguras para gerenciamento
 * de campanhas.
 * 
 * Segurança:
 * - Rotas de leitura (GET): Qualquer usuário autenticado
 * - Rotas de escrita (POST/PATCH/DELETE): Apenas Admin
 * 
 * Rotas Disponíveis:
 * - GET    /api/campanhas        - Lista todas as campanhas
 * - POST   /api/campanhas        - Cria nova campanha (Admin)
 * - GET    /api/campanhas/:id    - Busca campanha por ID
 * - PATCH  /api/campanhas/:id    - Atualiza campanha (Admin)
 * - DELETE /api/campanhas/:id    - Remove campanha (Admin)
 * 
 * @module CampanhasModule
 * ============================================================================
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { CampanhaService } from './campanha.service';
import { CriarCampanhaDto } from './dto/criar-campanha.dto';
import { AtualizarCampanhaDto } from './dto/atualizar-campanha.dto';
import { JwtAuthGuard } from '../comum/guards/jwt-auth.guard';
import { PapeisGuard } from '../comum/guards/papeis.guard';
import { Papeis } from '../comum/decorators/papeis.decorator';

/**
 * Controlador de campanhas.
 * 
 * Prefixo de rotas: /api/campanhas
 */
@Controller('campanhas')
export class CampanhaController {
  /**
   * Logger dedicado para rastrear requisições HTTP.
   */
  private readonly logger = new Logger(CampanhaController.name);

  /**
   * Construtor do controlador.
   * 
   * @param campanhaService - Serviço de campanhas
   */
  constructor(private readonly campanhaService: CampanhaService) {}

  /**
   * Lista campanhas visíveis para o usuário logado.
   *
   * ATUALIZADO (Sprint 17 - Tarefa 42):
   * - Filtra campanhas baseado no papel e ótica do usuário
   *
   * Rota: GET /api/campanhas
   * Acesso: Qualquer usuário autenticado
   *
   * @param req - Request com dados do usuário (injetado por JwtAuthGuard)
   * @returns Array de campanhas
   *
   * @example
   * ```
   * GET /api/campanhas
   * Authorization: Bearer <token>
   * ```
   *
   * Resposta (200):
   * ```
   * [
   *   {
   *     "id": "uuid",
   *     "titulo": "Campanha Lentes Q1 2025",
   *     "descricao": "...",
   *     "dataInicio": "2025-01-01T00:00:00.000Z",
   *     "dataFim": "2025-03-31T00:00:00.000Z",
   *     "moedinhasPorCartela": 1000,
   *     "pontosReaisPorCartela": "500.00",
   *     "status": "ATIVA",
   *     ...
   *   }
   * ]
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async listar(@Req() req) {
    const usuario = req.user;
    this.logger.log(`[GET] Listando campanhas para usuário: ${usuario.id} (${usuario.email})`);
    return this.campanhaService.listar(usuario);
  }

  /**
   * Cria uma nova campanha completa.
   * 
   * Rota: POST /api/campanhas
   * Acesso: Admin apenas
   * 
   * @param dto - Dados completos da campanha (aninhados)
   * @returns Campanha criada
   * 
   * @example
   * ```
   * POST /api/campanhas
   * Authorization: Bearer <token-admin>
   * Content-Type: application/json
   * 
   * {
   *   "titulo": "Campanha Lentes Q1 2025",
   *   "descricao": "Campanha focada em lentes premium...",
   *   "dataInicio": "2025-01-01",
   *   "dataFim": "2025-03-31",
   *   "pontosPorCartela": 1000,
   *   "valorPorCartela": 500,
   *   "percentualGerente": 0.10,
   *   "cartelas": [
   *     {
   *       "numeroCartela": 1,
   *       "descricao": "Cartela Bronze",
   *       "requisitos": [
   *         {
   *           "descricao": "Lentes BlueProtect Max",
   *           "quantidade": 5,
   *           "tipoUnidade": "PAR",
   *           "condicoes": [
   *             {
   *               "campo": "NOME_PRODUTO",
   *               "operador": "CONTEM",
   *               "valor": "BlueProtect"
   *             }
   *           ]
   *         }
   *       ]
   *     }
   *   ]
   * }
   * ```
   * 
   * Resposta (201):
   * ```
   * {
   *   "id": "uuid-da-campanha",
   *   "titulo": "Campanha Lentes Q1 2025",
   *   ...
   * }
   * ```
   */
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() dto: CriarCampanhaDto) {
    this.logger.log(`[POST] [ADMIN] Criando campanha: ${dto.titulo}`);
    return this.campanhaService.criar(dto);
  }

  /**
   * Busca uma campanha específica por ID com dados aninhados completos.
   *
   * ATUALIZADO (Sprint 17 - Tarefa 42):
   * - Verifica se o usuário tem permissão para ver esta campanha
   * - Inclui óticas alvo no retorno
   *
   * Rota: GET /api/campanhas/:id
   * Acesso: Qualquer usuário autenticado
   *
   * @param id - UUID da campanha
   * @param req - Request com dados do usuário (injetado por JwtAuthGuard)
   * @returns Campanha com dados aninhados
   *
   * @example
   * ```
   * GET /api/campanhas/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <token>
   * ```
   *
   * Resposta (200):
   * ```
   * {
   *   "id": "uuid",
   *   "titulo": "Campanha Lentes Q1 2025",
   *   "regrasCartelas": [
   *     {
   *       "id": "uuid",
   *       "numeroCartela": 1,
   *       "descricao": "Cartela Bronze",
   *       "requisitos": [
   *         {
   *           "id": "uuid",
   *           "descricao": "Lentes BlueProtect Max",
   *           "quantidade": 5,
   *           "tipoUnidade": "PAR",
   *           "condicoes": [
   *             {
   *               "id": "uuid",
   *               "campo": "NOME_PRODUTO",
   *               "operador": "CONTEM",
   *               "valor": "BlueProtect"
   *             }
   *           ]
   *         }
   *       ]
   *     }
   *   ],
   *   "oticasAlvo": [
   *     { "id": "uuid-otica-1", "nome": "Ótica Matriz Principal" },
   *     { "id": "uuid-otica-2", "nome": "Ótica Filial Norte" }
   *   ],
   *   ...
   * }
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async buscarPorId(@Param('id') id: string, @Req() req) {
    const usuario = req.user;
    this.logger.log(`[GET] Buscando campanha por ID: ${id} (usuário: ${usuario.email})`);
    return this.campanhaService.buscarPorId(id, usuario);
  }

  /**
   * Atualiza dados básicos de uma campanha existente.
   * 
   * Rota: PATCH /api/campanhas/:id
   * Acesso: Admin apenas
   * 
   * @param id - UUID da campanha
   * @param dto - Dados a serem atualizados
   * @returns Campanha atualizada
   * 
   * @example
   * ```
   * PATCH /api/campanhas/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <token-admin>
   * Content-Type: application/json
   * 
   * {
   *   "titulo": "Campanha Lentes Q1 2025 - PRORROGADA",
   *   "dataFim": "2025-04-30"
   * }
   * ```
   * 
   * Resposta (200):
   * ```
   * {
   *   "id": "uuid",
   *   "titulo": "Campanha Lentes Q1 2025 - PRORROGADA",
   *   "dataFim": "2025-04-30T00:00:00.000Z",
   *   ...
   * }
   * ```
   */
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis('ADMIN')
  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarCampanhaDto) {
    this.logger.log(`[PATCH] [ADMIN] Atualizando campanha: ${id}`);
    return this.campanhaService.atualizar(id, dto);
  }

  /**
   * Remove uma campanha do sistema.
   * 
   * Rota: DELETE /api/campanhas/:id
   * Acesso: Admin apenas
   * 
   * @param id - UUID da campanha
   * @returns Campanha removida
   * 
   * @example
   * ```
   * DELETE /api/campanhas/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer <token-admin>
   * ```
   * 
   * Resposta (200):
   * ```
   * {
   *   "id": "uuid",
   *   "titulo": "Campanha Lentes Q1 2025",
   *   ...
   * }
   * ```
   */
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis('ADMIN')
  @Delete(':id')
  async remover(@Param('id') id: string) {
    this.logger.log(`[DELETE] [ADMIN] Removendo campanha: ${id}`);
    return this.campanhaService.remover(id);
  }
}
