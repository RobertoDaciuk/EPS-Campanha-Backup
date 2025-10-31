/**
 * ============================================================================
 * OTICA CONTROLLER - Rotas HTTP do Módulo de Óticas
 * ============================================================================
 * 
 * Descrição:
 * Controlador responsável por expor endpoints HTTP para gerenciamento de
 * óticas parceiras. Define rotas para CRUD (Admin) e verificação pública
 * de CNPJ (para fluxo de auto-registro de usuários).
 * 
 * Base URL: /api/oticas
 * 
 * Rotas Públicas (sem autenticação):
 * - GET /api/oticas/verificar-cnpj/:cnpj
 *   Verifica se um CNPJ pertence a uma ótica parceira
 *   Usado no fluxo de auto-registro ("Jornada de João")
 * 
 * Rotas Admin (requerem autenticação - a implementar):
 * - POST /api/oticas - Criar ótica
 * - GET /api/oticas - Listar todas as óticas
 * - GET /api/oticas/:id - Buscar ótica por ID
 * - PATCH /api/oticas/:id - Atualizar ótica
 * - DELETE /api/oticas/:id - Remover ótica
 * 
 * Próxima Etapa:
 * Quando implementarmos autenticação (JWT), adicionar guard @UseGuards(JwtAuthGuard)
 * e @Roles('ADMIN') nas rotas de CRUD.
 * 
 * @module OticasModule
 * ============================================================================
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OticaService } from './otica.service';
import { JwtAuthGuard } from './../comum/guards/jwt-auth.guard';
import { PapeisGuard } from './../comum/guards/papeis.guard';
import { Papeis } from './../comum/decorators/papeis.decorator';
import { PapelUsuario } from '@prisma/client';
import { CriarOticaDto } from './dto/criar-otica.dto';
import { AtualizarOticaDto } from './dto/atualizar-otica.dto';
import { ListarOticasFiltroDto } from './dto/listar-oticas.filtro.dto';

/**
 * Controlador de rotas para gerenciamento de óticas.
 * 
 * Prefixo de rota: /api/oticas
 */
@Controller('oticas')
export class OticaController {
  /**
   * Logger dedicado para rastrear requisições HTTP do módulo de óticas.
   */
  private readonly logger = new Logger(OticaController.name);

  /**
   * Construtor do controlador.
   * 
   * @param oticaService - Serviço de lógica de negócio de óticas
   */
  constructor(private readonly oticaService: OticaService) {}

  // ==========================================================================
  // ROTA PÚBLICA: Verificar CNPJ (Fluxo de Auto-Registro)
  // ==========================================================================

  /**
   * Verifica se um CNPJ pertence a uma ótica parceira.
   * 
   * Esta rota é PÚBLICA (não requer autenticação) e é usada no fluxo de
   * auto-registro de vendedores/gerentes ("Jornada de João").
   * 
   * Quando um usuário se registra, ele informa o CNPJ da ótica dele. O
   * frontend chama esta rota para validar se o CNPJ é de uma parceira.
   * 
   * Se válido, exibe o nome da ótica para confirmação visual.
   * Se inválido, exibe erro amigável.
   * 
   * Rota: GET /api/oticas/verificar-cnpj/:cnpj
   * 
   * @param cnpj - CNPJ com ou sem pontuação (path parameter)
   * @returns Dados da ótica se encontrada
   * 
   * @throws {BadRequestException} Se CNPJ inválido (não tem 14 dígitos)
   * @throws {NotFoundException} Se CNPJ não cadastrado ou ótica inativa
   * 
   * @example
   * ```
   * # Com pontuação
   * GET /api/oticas/verificar-cnpj/12.345.678/0001-90
   * 
   * # Sem pontuação
   * GET /api/oticas/verificar-cnpj/12345678000190
   * ```
   * 
   * Resposta de Sucesso (200):
   * ```
   * {
   *   "id": "uuid",
   *   "cnpj": "12345678000190",
   *   "nome": "Ótica Central LTDA",
   *   "cidade": "São Paulo",
   *   "estado": "SP",
   *   "ativa": true
   * }
   * ```
   * 
   * Resposta de Erro (404):
   * ```
   * {
   *   "statusCode": 404,
   *   "message": "Este CNPJ não pertence a uma ótica parceira.",
   *   "error": "Not Found"
   * }
   * ```
   */
  @Get('verificar-cnpj/:cnpj')
  @HttpCode(HttpStatus.OK)
  async verificarCnpj(@Param('cnpj') cnpj: string) {
    this.logger.log(`[PÚBLICO] Verificando CNPJ: ${cnpj}`);

    const optica = await this.oticaService.buscarPorCnpjPublico(cnpj);

    return optica;
  }

  // ==========================================================================
  // ROTAS ADMIN: CRUD de Óticas
  // ==========================================================================
  // IMPORTANTE: Adicionar @UseGuards(JwtAuthGuard) e @Roles('ADMIN')
  // quando implementarmos autenticação JWT.
  // ==========================================================================

  /**
   * Cria uma nova ótica parceira.
   * 
   * Rota: POST /api/oticas
   * Acesso: Admin apenas (guard a implementar)
   * 
   * @param dados - Dados da ótica (validados pelo DTO)
   * @returns Ótica criada
   * 
   * @throws {BadRequestException} Se CNPJ inválido
   * @throws {ConflictException} Se CNPJ já cadastrado
   * 
   * @example
   * ```
   * POST /api/oticas
   * Content-Type: application/json
   * 
   * {
   *   "cnpj": "12.345.678/0001-90",
   *   "nome": "Ótica Central LTDA",
   *   "endereco": "Rua das Flores, 123",
   *   "cidade": "São Paulo",
   *   "estado": "SP",
   *   "telefone": "(11) 98765-4321",
   *   "email": "contato@oticacentral.com"
   * }
   * ```
   */

  /**
   * Lista todas as óticas cadastradas.
   * 
   * Rota: GET /api/oticas
   * Acesso: Admin apenas (guard a implementar)
   * 
   * @returns Array de óticas
   * 
   * @example
   * ```
   * GET /api/oticas
   * ```
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async listarTudo() {
    this.logger.log('[ADMIN] Listando todas as óticas');

    const oticas = await this.oticaService.listarTudo();

    return oticas;
  }

  /**
   * Busca uma ótica específica pelo ID.
   * 
   * Rota: GET /api/oticas/:id
   * Acesso: Admin apenas (guard a implementar)
   * 
   * @param id - UUID da ótica
   * @returns Ótica encontrada
   * 
   * @throws {NotFoundException} Se ótica não encontrada
   * 
   * @example
   * ```
   * GET /api/oticas/550e8400-e29b-41d4-a716-446655440000
   * ```
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async buscarPorId(@Param('id') id: string) {
    this.logger.log(`[ADMIN] Buscando ótica por ID: ${id}`);

    const optica = await this.oticaService.buscarPorId(id);

    return optica;
  }

  /**
   * Atualiza dados de uma ótica existente.
   * 
   * Permite atualização parcial (apenas campos enviados são atualizados).
   * 
   * Rota: PATCH /api/oticas/:id
   * Acesso: Admin apenas (guard a implementar)
   * 
   * @param id - UUID da ótica
   * @param dados - Dados a serem atualizados (validados pelo DTO)
   * @returns Ótica atualizada
   * 
   * @throws {NotFoundException} Se ótica não encontrada
   * @throws {BadRequestException} Se CNPJ inválido (caso seja atualizado)
   * @throws {ConflictException} Se novo CNPJ já em uso
   * 
   * @example
   * ```
   * PATCH /api/oticas/550e8400-e29b-41d4-a716-446655440000
   * Content-Type: application/json
   * 
   * {
   *   "telefone": "(11) 3333-4444",
   *   "email": "novo@email.com"
   * }
   * ```
   */

  /**
   * Remove uma ótica do sistema (soft delete).
   * 
   * A ótica é marcada como inativa, preservando histórico.
   * 
   * Rota: DELETE /api/oticas/:id
   * Acesso: Admin apenas (guard a implementar)
   * 
   * @param id - UUID da ótica
   * @returns Ótica desativada
   * 
   * @throws {NotFoundException} Se ótica não encontrada
   * 
   * @example
   * ```
   * DELETE /api/oticas/550e8400-e29b-41d4-a716-446655440000
   * ```
   */

    /**
   * Rota admin: Listar óticas com filtros.
   */
  @Get()
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  async listarAdmin(@Query() filtros: ListarOticasFiltroDto) {
    this.logger.log(`ADMIN: Listando óticas (filtros: ${JSON.stringify(filtros)})`);
    return await this.oticaService.listarAdmin(filtros);
  }

  /**
   * Rota admin: Criar nova ótica.
   */
  @Post()
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() dto: CriarOticaDto) {
    this.logger.log(`ADMIN: Criando ótica: ${dto.nome}`);
    return await this.oticaService.criar(dto);
  }

  /**
   * Rota admin: Buscar ótica por ID.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  async buscarPorIdAdmin(@Param('id') id: string) {
    this.logger.log(`ADMIN: Buscando ótica por ID: ${id}`);
    return await this.oticaService.buscarPorIdAdmin(id);
  }

  /**
   * Rota admin: Atualizar dados de uma ótica.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarOticaDto) {
    this.logger.log(`ADMIN: Atualizando ótica (ID: ${id})`);
    return await this.oticaService.atualizar(id, dto);
  }

  /**
   * Rota admin: Desativar ótica (soft delete).
   */
  @Patch(':id/desativar')
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  async desativar(@Param('id') id: string) {
    this.logger.log(`ADMIN: Desativando ótica (ID: ${id})`);
    return await this.oticaService.desativar(id);
  }

  /**
   * Rota admin: Reativar ótica.
   */
  @Patch(':id/reativar')
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  async reativar(@Param('id') id: string) {
    this.logger.log(`ADMIN: Reativando ótica (ID: ${id})`);
    return await this.oticaService.reativar(id);
  }
}
