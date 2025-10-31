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
exports.ResgateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ResgateService = class ResgateService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async solicitar(dto, vendedorId) {
        return this.prisma.$transaction(async (tx) => {
            const premio = await tx.premio.findUnique({ where: { id: dto.premioId } });
            const vendedor = await tx.usuario.findUnique({ where: { id: vendedorId } });
            if (!premio)
                throw new common_1.NotFoundException('Prêmio não encontrado.');
            if (!vendedor)
                throw new common_1.NotFoundException('Vendedor não encontrado.');
            if (vendedor.saldoMoedinhas < premio.custoMoedinhas) {
                throw new common_1.BadRequestException('Saldo de moedinhas insuficiente.');
            }
            if (premio.estoque <= 0) {
                throw new common_1.BadRequestException('Prêmio fora de estoque.');
            }
            await tx.usuario.update({
                where: { id: vendedorId },
                data: { saldoMoedinhas: { decrement: premio.custoMoedinhas } }
            });
            await tx.premio.update({
                where: { id: dto.premioId },
                data: { estoque: { decrement: 1 } }
            });
            const resgate = await tx.resgatePremio.create({
                data: {
                    vendedorId,
                    premioId: dto.premioId,
                    status: client_1.StatusResgate.SOLICITADO
                }
            });
            const mensagem = `Sua solicitação de resgate do prêmio '${premio.nome}' foi recebida!`;
            await tx.notificacao.create({
                data: {
                    usuarioId: vendedorId,
                    mensagem,
                    linkUrl: '/premios/meus-resgates'
                }
            });
            return resgate;
        });
    }
    async listarAdmin(filtros) {
        const where = { ...filtros };
        return this.prisma.resgatePremio.findMany({
            where,
            include: {
                vendedor: { select: { id: true, nome: true, email: true } },
                premio: { select: { id: true, nome: true } }
            },
            orderBy: { dataSolicitacao: 'desc' }
        });
    }
    async meusResgates(vendedorId) {
        return this.prisma.resgatePremio.findMany({
            where: { vendedorId },
            include: {
                premio: { select: { id: true, nome: true, imageUrl: true } }
            },
            orderBy: { dataSolicitacao: 'desc' }
        });
    }
    async marcarEnviado(resgateId) {
        return this.prisma.$transaction(async (tx) => {
            const resgate = await tx.resgatePremio.findUnique({
                where: { id: resgateId },
                include: { premio: true }
            });
            if (!resgate)
                throw new common_1.NotFoundException('Resgate não encontrado.');
            if (resgate.status !== client_1.StatusResgate.SOLICITADO) {
                throw new common_1.BadRequestException('Este resgate não pode ser marcado como enviado.');
            }
            const resgateAtualizado = await tx.resgatePremio.update({
                where: { id: resgateId },
                data: { status: client_1.StatusResgate.ENVIADO }
            });
            const mensagem = `Seu prêmio '${resgate.premio.nome}' foi enviado!`;
            await tx.notificacao.create({
                data: {
                    usuarioId: resgate.vendedorId,
                    mensagem,
                    linkUrl: '/premios/meus-resgates'
                }
            });
            return resgateAtualizado;
        });
    }
    async cancelarEstorno(resgateId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const resgate = await tx.resgatePremio.findUnique({
                where: { id: resgateId },
                include: { premio: true }
            });
            if (!resgate)
                throw new common_1.NotFoundException('Resgate não encontrado.');
            if (resgate.status !== client_1.StatusResgate.SOLICITADO) {
                throw new common_1.BadRequestException('Este resgate não pode ser cancelado.');
            }
            const premio = await tx.premio.findUnique({ where: { id: resgate.premioId } });
            if (!premio)
                throw new common_1.NotFoundException('Prêmio não encontrado para estorno.');
            await tx.usuario.update({
                where: { id: resgate.vendedorId },
                data: { saldoMoedinhas: { increment: premio.custoMoedinhas } }
            });
            await tx.premio.update({
                where: { id: resgate.premioId },
                data: { estoque: { increment: 1 } }
            });
            const resgateCancelado = await tx.resgatePremio.update({
                where: { id: resgateId },
                data: {
                    status: client_1.StatusResgate.CANCELADO,
                    motivoCancelamento: dto.motivoCancelamento
                }
            });
            const mensagem = `Seu resgate do prêmio '${premio.nome}' foi cancelado. ${premio.custoMoedinhas} moedinhas foram estornadas.`;
            await tx.notificacao.create({
                data: {
                    usuarioId: resgate.vendedorId,
                    mensagem,
                    linkUrl: '/premios/meus-resgates'
                }
            });
            return resgateCancelado;
        });
    }
};
exports.ResgateService = ResgateService;
exports.ResgateService = ResgateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResgateService);
//# sourceMappingURL=resgate.service.js.map