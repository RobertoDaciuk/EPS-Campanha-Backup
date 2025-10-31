/**
 * ============================================================================
 * DASHBOARD CONTROLLER - Rotas (Implementado)
 * ============================================================================
 *
 * Propósito:
 * Expõe um endpoint unificado e protegido para buscar os KPIs
 * relevantes para o usuário autenticado.
 *
 * Endpoint:
 * - GET /api/dashboard/kpis (Protegido por JWT)
 *
 * Princípios Aplicados:
 * - Princípio 5.4 (Segurança RBAC): A lógica de RBAC é aplicada no
 * controlador para direcionar a chamada ao serviço correto.
 * - Princípio 5.5 (Isolamento de Dados): O ID do usuário autenticado
 * é extraído do request (`req.user`) e passado para o serviço.
 *
 * @module DashboardModule
 * ============================================================================
 */

import {
  Controller,
  Get,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../comum/guards/jwt-auth.guard';
import { PapelUsuario } from '@prisma/client';

/**
 * Interface para o payload do usuário autenticado injetado pelo JwtAuthGuard.
 */
interface UsuarioAutenticado {
  id: string;
  email: string;
  papel: PapelUsuario;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/kpis
   *
   * Endpoint unificado que busca os KPIs corretos com base no
   * papel (RBAC) do usuário autenticado.
   *
   * @param req - Objeto Request injetado, contendo `req.user` do JwtAuthGuard.
   * @returns Objeto contendo os KPIs específicos do perfil do usuário.
   * @throws UnauthorizedException - Se o usuário não estiver autenticado.
   */
  @UseGuards(JwtAuthGuard) // Protege a rota, garantindo que req.user exista
  @Get('kpis')
  async getKpis(@Request() req: { user: UsuarioAutenticado }) {
    const usuario = req.user;

    if (!usuario) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    // Log de desenvolvimento (Princípio 5.3)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[DASHBOARD] Buscando KPIs para: ${usuario.email} (Papel: ${usuario.papel})`,
      );
    }

    // Direciona a chamada com base no Papel (Princípio 5.4)
    switch (usuario.papel) {
      case PapelUsuario.ADMIN:
        return this.dashboardService.getKpisAdmin();
      case PapelUsuario.GERENTE:
        return this.dashboardService.getKpisGerente(usuario.id);
      case PapelUsuario.VENDEDOR:
        return this.dashboardService.getKpisVendedor(usuario.id);
      default:
        // Caso um papel desconhecido (ex: futuro 'AUDITOR') tente acessar
        throw new UnauthorizedException('Perfil de usuário não suportado.');
    }
  }
}