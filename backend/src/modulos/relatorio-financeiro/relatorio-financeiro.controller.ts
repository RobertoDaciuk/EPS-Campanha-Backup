import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './../comum/guards/jwt-auth.guard';
import { PapeisGuard } from './../comum/guards/papeis.guard';
import { Papeis } from './../comum/decorators/papeis.decorator';
import { PapelUsuario } from '@prisma/client';
import { RelatorioFinanceiroService } from './relatorio-financeiro.service';
import { ListarRelatoriosFiltroDto } from './dto/listar-relatorios.filtro.dto';

/**
 * Controlador seguro para relatórios financeiros, exclusivo para Admin.
 */
@UseGuards(JwtAuthGuard, PapeisGuard)
@Papeis(PapelUsuario.ADMIN)
@Controller('relatorios-financeiros')
export class RelatorioFinanceiroController {
  constructor(private readonly relatorioService: RelatorioFinanceiroService) {}

  /**
   * Listagem robusta: filtra por status, campanha, usuário, tipo e datas.
   */
  @Get()
  async listar(@Query() filtros: ListarRelatoriosFiltroDto) {
    return this.relatorioService.listar(filtros);
  }

  /**
   * Busca por ID (detalhamento).
   */
  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.relatorioService.buscarPorId(id);
  }

  /**
   * Marca como pago de forma transacional e dispara notificação.
   */
  @Patch(':id/marcar-como-pago')
  async marcarComoPago(@Param('id') id: string) {
    return this.relatorioService.marcarComoPago(id);
  }
}
