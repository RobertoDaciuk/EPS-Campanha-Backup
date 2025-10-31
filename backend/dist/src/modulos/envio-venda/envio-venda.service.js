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
var EnvioVendaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvioVendaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const recompensa_service_1 = require("../recompensa/recompensa.service");
let EnvioVendaService = EnvioVendaService_1 = class EnvioVendaService {
    constructor(prisma, recompensaService) {
        this.prisma = prisma;
        this.recompensaService = recompensaService;
        this.logger = new common_1.Logger(EnvioVendaService_1.name);
    }
    async criar(dto, vendedorId) {
        this.logger.log(`[CRIAR_ENVIO] Vendedor ${vendedorId} submetendo pedido ${dto.numeroPedido} para campanha ${dto.campanhaId}, requisito ${dto.requisitoId}`);
        this.logger.log(`[DUPLICATA] Verificando duplicidade para Pedido: ${dto.numeroPedido}, Vendedor: ${vendedorId}, Campanha: ${dto.campanhaId}`);
        const envioExistente = await this.prisma.envioVenda.findFirst({
            where: {
                numeroPedido: dto.numeroPedido,
                vendedorId: vendedorId,
                campanhaId: dto.campanhaId,
            },
        });
        if (envioExistente) {
            this.logger.warn(`[DUPLICATA] Tentativa de submissão duplicada detectada! Pedido: ${dto.numeroPedido}, Vendedor: ${vendedorId}, Envio Existente: ${envioExistente.id}`);
            throw new common_1.BadRequestException('Você já submeteu este número de pedido nesta campanha.');
        }
        this.logger.log('[DUPLICATA] Nenhuma duplicidade encontrada, prosseguindo com a criação.');
        const envio = await this.prisma.envioVenda.create({
            data: {
                numeroPedido: dto.numeroPedido,
                vendedorId,
                campanhaId: dto.campanhaId,
                requisitoId: dto.requisitoId,
            },
        });
        this.logger.log(`[CRIAR_ENVIO] Envio ${envio.id} criado com sucesso. Status: EM_ANALISE`);
        return envio;
    }
    async listar(usuario, filtros) {
        const where = {};
        if (filtros.status)
            where.status = filtros.status;
        if (filtros.campanhaId)
            where.campanhaId = filtros.campanhaId;
        if (filtros.vendedorId)
            where.vendedorId = filtros.vendedorId;
        if (usuario.papel === 'VENDEDOR') {
            where.vendedorId = usuario.id;
        }
        else if (usuario.papel === 'GERENTE') {
            const equipe = await this.prisma.usuario.findMany({
                where: { gerenteId: usuario.id },
                select: { id: true },
            });
            const idsEquipe = equipe.map((u) => u.id);
            if (idsEquipe.length) {
                where.vendedorId = { in: idsEquipe };
            }
            else {
                where.vendedorId = '-';
            }
        }
        this.logger.log(`[LISTAR] Papel: ${usuario.papel}. Params: ${JSON.stringify(where)}`);
        return this.prisma.envioVenda.findMany({
            where,
            include: {
                vendedor: { select: { id: true, nome: true, email: true } },
                requisito: { select: { id: true, descricao: true } },
            },
        });
    }
    async listarMinhasPorCampanha(vendedorId, campanhaId) {
        this.logger.log(`[listarMinhasPorCampanha] Vendedor ${vendedorId} buscando envios da campanha ${campanhaId}`);
        return this.prisma.envioVenda.findMany({
            where: {
                vendedorId: vendedorId,
                campanhaId: campanhaId,
            },
            select: {
                id: true,
                numeroPedido: true,
                status: true,
                dataEnvio: true,
                dataValidacao: true,
                motivoRejeicao: true,
                requisitoId: true,
                numeroCartelaAtendida: true,
            },
            orderBy: {
                dataEnvio: 'desc',
            },
        });
    }
    async validarManual(envioId) {
        const envio = await this.prisma.envioVenda.findUnique({
            where: { id: envioId },
            include: {
                vendedor: { include: { gerente: true } },
                requisito: {
                    include: {
                        regraCartela: { include: { campanha: true } },
                    },
                },
            },
        });
        if (!envio)
            throw new common_1.NotFoundException('Envio não encontrado.');
        return this.prisma.$transaction(async (tx) => {
            const requisitosRelacionados = await tx.requisitoCartela.findMany({
                where: {
                    ordem: envio.requisito.ordem,
                    regraCartela: {
                        campanhaId: envio.campanhaId,
                    },
                },
                select: {
                    id: true,
                },
            });
            const idsRequisitosRelacionados = requisitosRelacionados.map((r) => r.id);
            this.logger.log(`[SPILLOVER] Requisito ordem ${envio.requisito.ordem}: IDs relacionados = ${idsRequisitosRelacionados.join(', ')}`);
            const countValidado = await tx.envioVenda.count({
                where: {
                    vendedorId: envio.vendedorId,
                    requisitoId: { in: idsRequisitosRelacionados },
                    status: client_1.StatusEnvioVenda.VALIDADO,
                },
            });
            const quantidadeRequisito = envio.requisito.quantidade;
            const numeroCartela = Math.floor(countValidado / quantidadeRequisito) + 1;
            this.logger.log(`[ADMIN] Validação manual do envio ${envioId}: countValidado=${countValidado}, quantidade=${quantidadeRequisito}, numeroCartelaAtendida=${numeroCartela}`);
            const envioAtualizado = await tx.envioVenda.update({
                where: { id: envioId },
                data: {
                    status: client_1.StatusEnvioVenda.VALIDADO,
                    numeroCartelaAtendida: numeroCartela,
                    dataValidacao: new Date(),
                    motivoRejeicao: null,
                    infoConflito: null,
                },
            });
            const campanha = envio.requisito.regraCartela.campanha;
            const vendedor = envio.vendedor;
            await this.recompensaService.processarGatilhos(tx, envioAtualizado, campanha, vendedor);
            return envioAtualizado;
        });
    }
    async rejeitarManual(envioId, dto) {
        const envio = await this.prisma.envioVenda.findUnique({
            where: { id: envioId },
        });
        if (!envio)
            throw new common_1.NotFoundException('Envio não encontrado.');
        this.logger.log(`[ADMIN] Rejeição manual do envio ${envioId} pelo motivo: ${dto.motivoRejeicao}`);
        return this.prisma.envioVenda.update({
            where: { id: envioId },
            data: {
                status: client_1.StatusEnvioVenda.REJEITADO,
                motivoRejeicao: dto.motivoRejeicao,
                numeroCartelaAtendida: null,
                dataValidacao: new Date(),
                infoConflito: null,
            },
        });
    }
};
exports.EnvioVendaService = EnvioVendaService;
exports.EnvioVendaService = EnvioVendaService = EnvioVendaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        recompensa_service_1.RecompensaService])
], EnvioVendaService);
//# sourceMappingURL=envio-venda.service.js.map