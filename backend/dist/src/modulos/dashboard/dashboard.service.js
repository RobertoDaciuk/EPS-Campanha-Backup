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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKpisAdmin() {
        const [usuariosPendentes, vendasEmAnalise, resgatesSolicitados, oticasAtivas,] = await this.prisma.$transaction([
            this.prisma.usuario.count({
                where: { status: 'PENDENTE' },
            }),
            this.prisma.envioVenda.count({
                where: { status: 'EM_ANALISE' },
            }),
            this.prisma.resgatePremio.count({
                where: { status: 'SOLICITADO' },
            }),
            this.prisma.optica.count({
                where: { ativa: true },
            }),
        ]);
        return {
            usuariosPendentes,
            vendasEmAnalise,
            resgatesSolicitados,
            oticasAtivas,
        };
    }
    async getKpisGerente(usuarioId) {
        const [totalVendedores, vendasTimeAnalise, comissaoPendente, totalMoedinhasTime,] = await this.prisma.$transaction([
            this.prisma.usuario.count({
                where: { gerenteId: usuarioId },
            }),
            this.prisma.envioVenda.count({
                where: {
                    vendedor: {
                        gerenteId: usuarioId,
                    },
                    status: 'EM_ANALISE',
                },
            }),
            this.prisma.relatorioFinanceiro.aggregate({
                _sum: {
                    valor: true,
                },
                where: {
                    usuarioId: usuarioId,
                    tipo: 'GERENTE',
                    status: 'PENDENTE',
                },
            }),
            this.prisma.usuario.aggregate({
                _sum: {
                    rankingMoedinhas: true,
                },
                where: {
                    gerenteId: usuarioId,
                },
            }),
        ]);
        return {
            totalVendedores: totalVendedores ?? 0,
            vendasTimeAnalise: vendasTimeAnalise ?? 0,
            comissaoPendente: comissaoPendente._sum.valor?.toNumber() ?? 0,
            totalMoedinhasTime: Number(totalMoedinhasTime._sum.rankingMoedinhas ?? 0),
        };
    }
    async getKpisVendedor(usuarioId) {
        const [usuario, vendasAprovadas, cartelasCompletas, posicaoRankingResult,] = await this.prisma.$transaction([
            this.prisma.usuario.findUnique({
                where: { id: usuarioId },
                select: {
                    saldoMoedinhas: true,
                    rankingMoedinhas: true,
                    nivel: true,
                },
            }),
            this.prisma.envioVenda.count({
                where: {
                    vendedorId: usuarioId,
                    status: 'VALIDADO',
                },
            }),
            this.prisma.cartelaConcluida.count({
                where: { vendedorId: usuarioId },
            }),
            this.prisma.$queryRaw(client_1.Prisma.sql `
          WITH Ranking AS (
            SELECT
              id,
              "rankingMoedinhas",
              ROW_NUMBER() OVER (ORDER BY "rankingMoedinhas" DESC, "criadoEm" ASC) as posicao
            FROM
              "usuarios"
            WHERE
              papel = ${client_1.PapelUsuario.VENDEDOR}::"PapelUsuario"
              AND status = ${client_1.StatusUsuario.ATIVO}::"StatusUsuario"
          )
          SELECT
            posicao
          FROM
            Ranking
          WHERE
            id = ${usuarioId}
        `),
        ]);
        const posicaoRanking = posicaoRankingResult.length > 0
            ? Number(posicaoRankingResult[0].posicao)
            : 0;
        return {
            saldoMoedinhas: usuario?.saldoMoedinhas ?? 0,
            rankingMoedinhas: usuario?.rankingMoedinhas ?? 0,
            nivel: usuario?.nivel ?? 'BRONZE',
            vendasAprovadas: vendasAprovadas ?? 0,
            cartelasCompletas: cartelasCompletas ?? 0,
            posicaoRanking,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map