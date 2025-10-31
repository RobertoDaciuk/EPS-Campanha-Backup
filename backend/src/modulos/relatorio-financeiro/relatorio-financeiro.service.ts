import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListarRelatoriosFiltroDto } from './dto/listar-relatorios.filtro.dto';
import { Prisma } from '@prisma/client';

/**
 * Serviço de lógica financeira para relatórios e pagamentos.
 */
@Injectable()
export class RelatorioFinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista relatórios financeiros conforme filtros do Admin.
   */
  async listar(filtros: ListarRelatoriosFiltroDto) {
    const where: Prisma.RelatorioFinanceiroWhereInput = {};

    if (filtros.status) where.status = filtros.status;
    if (filtros.campanhaId) where.campanhaId = filtros.campanhaId;
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros.tipo) where.tipo = filtros.tipo;

    if (filtros.dataInicio || filtros.dataFim) {
      where.dataGerado = {};
      if (filtros.dataInicio) {
        where.dataGerado.gte = new Date(filtros.dataInicio);
      }
      if (filtros.dataFim) {
        where.dataGerado.lte = new Date(filtros.dataFim);
      }
    }

    return this.prisma.relatorioFinanceiro.findMany({
      where,
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        campanha: { select: { id: true, titulo: true } },
      },
      orderBy: { dataGerado: 'desc' },
    });
  }

  /**
   * Busca relatório financeiro único por ID.
   */
  async buscarPorId(id: string) {
    return this.prisma.relatorioFinanceiro.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        campanha: { select: { id: true, titulo: true } },
      },
    });
  }

  /**
   * Marca relatório financeiro como pago e dispara notificação transacional.
   */
  async marcarComoPago(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const relatorio = await tx.relatorioFinanceiro.findUnique({
        where: { id },
        include: {
          campanha: { select: { titulo: true } },
        },
      });
      if (!relatorio) throw new NotFoundException('Relatório não encontrado');
      if (relatorio.status === 'PAGO') throw new BadRequestException('Relatório já está pago');

      const relatorioAtualizado = await tx.relatorioFinanceiro.update({
        where: { id },
        data: { status: 'PAGO', dataPagamento: new Date() },
      });

      // Gatilho de notificação para o usuário
      const mensagem = `Seu pagamento de R$ ${relatorio.valor.toFixed(2)} referente à campanha '${relatorio.campanha.titulo}' foi processado!`;
      await tx.notificacao.create({
        data: {
          usuarioId: relatorio.usuarioId,
          mensagem,
          linkUrl: '/financeiro',
        },
      });

      return relatorioAtualizado;
    });
  }
}
