/**
 * ============================================================================
 * CAMPANHA CONTROLLER - Rotas HTTP do Módulo de Campanhas (CORRIGIDO)
 * ============================================================================
 * * Descrição:
 * Controlador responsável por expor rotas HTTP seguras para gerenciamento
 * de campanhas.
 * * CORREÇÃO (Q.I. 170 - Erro TS2554):
 * - Adicionado `req` ao método `remover` e passado `req.user` para o service,
 * atendendo à nova assinatura do `campanhaService.remover(id, usuario)`.
 * * Segurança:
 * - Rotas de leitura (GET): Qualquer usuário autenticado
 * - Rotas de escrita (POST/PATCH/DELETE): Apenas Admin
 * * @module CampanhasModule
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
 * * Prefixo de rotas: /api/campanhas
 */
@Controller('campanhas')
export class CampanhaController {
  /**
   * Logger dedicado para rastrear requisições HTTP.
   */
  private readonly logger = new Logger(CampanhaController.name);

  /**
   * Construtor do controlador.
   * * @param campanhaService - Serviço de campanhas
   */
  constructor(private readonly campanhaService: CampanhaService) {}

  /**
   * Lista campanhas visíveis para o usuário logado.
   *
   * Rota: GET /api/campanhas
   * Acesso: Qualquer usuário autenticado
   *
   * @param req - Request com dados do usuário (injetado por JwtAuthGuard)
   * @returns Array de campanhas
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
   * * Rota: POST /api/campanhas
   * Acesso: Admin apenas
   * * @param dto - Dados completos da campanha (aninhados)
   * @returns Campanha criada
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
   * Rota: GET /api/campanhas/:id
   * Acesso: Qualquer usuário autenticado
   *
   * @param id - UUID da campanha
   * @param req - Request com dados do usuário (injetado por JwtAuthGuard)
   * @returns Campanha com dados aninhados
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
   * * Rota: PATCH /api/campanhas/:id
   * Acesso: Admin apenas
   * * @param id - UUID da campanha
   * @param dto - Dados a serem atualizados
   * @returns Campanha atualizada
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
   * * Rota: DELETE /api/campanhas/:id
   * Acesso: Admin apenas
   * * @param id - UUID da campanha
   * @param req - Request com dados do usuário (injetado por JwtAuthGuard)
   * @returns Campanha removida
   */
  @UseGuards(JwtAuthGuard, PapeisGuard)
  @Papeis('ADMIN')
  @Delete(':id')
  async remover(@Param('id') id: string, @Req() req) { // Adicionado @Req() req
    this.logger.log(`[DELETE] [ADMIN] Removendo campanha: ${id}`);
    // CORREÇÃO: Passando o req.user para o service para verificar acesso/existência
    return this.campanhaService.remover(id, req.user); 
  }
}