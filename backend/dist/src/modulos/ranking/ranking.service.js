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
var RankingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RankingService = RankingService_1 = class RankingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RankingService_1.name);
    }
    async getPosicaoUsuario(usuarioId) {
        const todosUsuarios = await this.prisma.usuario.findMany({
            where: { papel: client_1.PapelUsuario.VENDEDOR },
            select: { id: true },
            orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
        });
        const posicao = todosUsuarios.findIndex((u) => u.id === usuarioId) + 1;
        return { posicao };
    }
    async getRankingEquipe(gerenteId) {
        return this.prisma.usuario.findMany({
            where: { gerenteId },
            select: { id: true, nome: true, avatarUrl: true, rankingMoedinhas: true },
            orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
        });
    }
    async getRankingGeralPaginado(dto) {
        const pagina = dto.pagina ?? 1;
        const porPagina = dto.porPagina ?? 20;
        const skip = (pagina - 1) * porPagina;
        const take = porPagina;
        const [usuarios, total] = await this.prisma.$transaction([
            this.prisma.usuario.findMany({
                where: { papel: client_1.PapelUsuario.VENDEDOR },
                select: {
                    id: true,
                    nome: true,
                    avatarUrl: true,
                    rankingMoedinhas: true,
                    nivel: true,
                    optica: {
                        select: {
                            nome: true,
                        },
                    },
                },
                orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
                skip,
                take,
            }),
            this.prisma.usuario.count({ where: { papel: client_1.PapelUsuario.VENDEDOR } }),
        ]);
        const totalPaginas = Math.ceil(total / porPagina);
        const dadosComPosicao = usuarios.map((usuario, index) => ({
            ...usuario,
            posicao: skip + index + 1,
        }));
        return {
            dados: dadosComPosicao,
            paginaAtual: pagina,
            totalPaginas,
            totalRegistros: total,
        };
    }
    async getRankingFiliaisParaMatriz(matrizGerenteId) {
        this.logger.log(`Buscando rankings por filial para Gerente Matriz ID: ${matrizGerenteId}`);
        const gerenteMatriz = await this.prisma.usuario.findUnique({
            where: { id: matrizGerenteId, papel: client_1.PapelUsuario.GERENTE },
            include: {
                optica: {
                    include: {
                        filiais: {
                            select: { id: true, nome: true },
                            where: { ativa: true },
                            orderBy: { nome: 'asc' },
                        },
                    },
                },
            },
        });
        if (!gerenteMatriz || !gerenteMatriz.optica || !gerenteMatriz.optica.ehMatriz) {
            this.logger.warn(`Usuário ${matrizGerenteId} não é um Gerente de Matriz válido.`);
            throw new common_1.ForbiddenException('Acesso negado. Apenas gerentes de matriz podem ver rankings por filial.');
        }
        const matriz = gerenteMatriz.optica;
        const filiais = matriz.filiais;
        const buscarRankingOptica = async (opticaId) => {
            return this.prisma.usuario.findMany({
                where: {
                    opticaId: opticaId,
                    papel: client_1.PapelUsuario.VENDEDOR,
                    status: client_1.StatusUsuario.ATIVO,
                },
                select: {
                    id: true,
                    nome: true,
                    avatarUrl: true,
                    rankingMoedinhas: true,
                    nivel: true,
                },
                orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
                take: 100,
            });
        };
        const [rankingMatriz, ...rankingsFiliais] = await Promise.all([
            buscarRankingOptica(matriz.id),
            ...filiais.map(filial => buscarRankingOptica(filial.id)),
        ]);
        const resultado = {
            matriz: {
                id: matriz.id,
                nome: matriz.nome,
                ranking: rankingMatriz,
            },
            filiais: filiais.map((filial, index) => ({
                id: filial.id,
                nome: filial.nome,
                ranking: rankingsFiliais[index],
            })),
        };
        this.logger.log(`Rankings por filial para Gerente ${matrizGerenteId} (${matriz.nome}) buscados com sucesso.`);
        return resultado;
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = RankingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RankingService);
//# sourceMappingURL=ranking.service.js.map