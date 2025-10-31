"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioFinanceiroService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RelatorioFinanceiroService = class RelatorioFinanceiroService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listar(filtros) {
        const where = {};
        if (filtros.status)
            where.status = filtros.status;
        if (filtros.campanhaId)
            where.campanhaId = filtros.campanhaId;
        if (filtros.usuarioId)
            where.usuarioId = filtros.usuarioId;
        if (filtros.tipo)
            where.tipo = filtros.tipo;
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
    async buscarPorId(id) {
        return this.prisma.relatorioFinanceiro.findUnique({
            where: { id },
            include: {
                usuario: { select: { id: true, nome: true, email: true } },
                campanha: { select: { id: true, titulo: true } },
            },
        });
    }
    async marcarComoPago(id) {
        return this.prisma.$transaction(async (tx) => {
            const relatorio = await tx.relatorioFinanceiro.findUnique({
                where: { id },
                include: {
                    campanha: { select: { titulo: true } },
                },
            });
            if (!relatorio)
                throw new common_1.NotFoundException('Relatório não encontrado');
            if (relatorio.status === 'PAGO')
                throw new common_1.BadRequestException('Relatório já está pago');
            const relatorioAtualizado = await tx.relatorioFinanceiro.update({
                where: { id },
                data: { status: 'PAGO', dataPagamento: new Date() },
            });
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
};
exports.RelatorioFinanceiroService = RelatorioFinanceiroService;
exports.RelatorioFinanceiroService = RelatorioFinanceiroService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RelatorioFinanceiroService);
//# sourceMappingURL=relatorio-financeiro.service.js.map