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
exports.PremioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const armazenamento_service_1 = require("../upload/armazenamento.service");
let PremioService = class PremioService {
    constructor(prisma, armazenamentoService) {
        this.prisma = prisma;
        this.armazenamentoService = armazenamentoService;
    }
    async criar(dto) {
        return this.prisma.premio.create({ data: dto });
    }
    async listar() {
        return this.prisma.premio.findMany({
            where: { ativo: true, estoque: { gt: 0 } },
            orderBy: { custoMoedinhas: 'asc' },
        });
    }
    async listarTodosAdmin() {
        return this.prisma.premio.findMany({
            orderBy: { nome: 'asc' },
        });
    }
    async buscarPorId(premioId) {
        const premio = await this.prisma.premio.findUnique({ where: { id: premioId } });
        if (!premio)
            throw new common_1.NotFoundException('Prêmio não encontrado.');
        return premio;
    }
    async uploadImagem(premioId, file) {
        await this.buscarPorId(premioId);
        const imageUrl = await this.armazenamentoService.uploadArquivo(file.buffer, file.mimetype, 'premios', premioId);
        return this.prisma.premio.update({
            where: { id: premioId },
            data: { imageUrl },
        });
    }
    async atualizar(id, dto) {
        return this.prisma.premio.update({
            where: { id },
            data: dto,
        });
    }
    async remover(id) {
        return this.prisma.premio.delete({ where: { id } });
    }
};
exports.PremioService = PremioService;
exports.PremioService = PremioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        armazenamento_service_1.ArmazenamentoService])
], PremioService);
//# sourceMappingURL=premio.service.js.map