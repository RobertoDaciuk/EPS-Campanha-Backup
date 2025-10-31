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
const ranking_service_1 = require("./../ranking/ranking.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma, rankingService) {
        this.prisma = prisma;
        this.rankingService = rankingService;
    }
    async getVendedorKpis(usuarioId) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: { saldoMoedinhas: true, rankingMoedinhas: true, nivel: true },
        });
        if (!usuario)
            throw new Error('Usuário não encontrado.');
        const { posicao } = await this.rankingService.getPosicaoUsuario(usuarioId);
        const campanhasAtivasCount = await this.prisma.campanha.count({
            where: { status: 'ATIVA' },
        });
        return {
            saldoMoedinhas: usuario.saldoMoedinhas,
            rankingMoedinhas: usuario.rankingMoedinhas,
            nivel: usuario.nivel,
            posicaoRanking: posicao,
            totalCampanhasAtivas: campanhasAtivasCount,
        };
    }
    async getGerenteKpis(usuarioId) {
        const rankingEquipe = await this.rankingService.getRankingEquipe(usuarioId);
        const melhorVendedor = rankingEquipe.length > 0 ? rankingEquipe[0] : null;
        const somaPendentes = await this.prisma.relatorioFinanceiro.aggregate({
            _sum: { valor: true },
            where: {
                usuarioId,
                tipo: 'GERENTE',
                status: client_1.StatusPagamento.PENDENTE,
            },
        });
        return {
            melhorVendedor,
            ganhosPendentesGerencia: somaPendentes._sum.valor ?? 0,
            rankingEquipe,
        };
    }
    async getAdminKpis() {
        const totalUsuarios = await this.prisma.usuario.count();
        const totalCampanhasAtivas = await this.prisma.campanha.count({
            where: { status: 'ATIVA' },
        });
        const totalVendasValidadas = await this.prisma.envioVenda.count({
            where: { status: 'VALIDADO' },
        });
        const somaMoedinhas = await this.prisma.campanha.aggregate({
            _sum: { moedinhasPorCartela: true },
            where: { cartelasConcluidas: { some: {} } },
        });
        const somaFinanceiro = await this.prisma.relatorioFinanceiro.aggregate({
            _sum: { valor: true },
            where: { status: client_1.StatusPagamento.PENDENTE },
        });
        return {
            totalUsuarios,
            totalCampanhasAtivas,
            totalVendasValidadas,
            totalMoedinhasDistribuidas: somaMoedinhas._sum.moedinhasPorCartela ?? 0,
            totalFinanceiroPendente: somaFinanceiro._sum.valor ?? 0,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ranking_service_1.RankingService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map