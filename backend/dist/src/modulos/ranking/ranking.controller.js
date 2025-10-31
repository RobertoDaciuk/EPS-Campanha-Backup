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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RankingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("./../comum/guards/papeis.guard");
const papeis_decorator_1 = require("./../comum/decorators/papeis.decorator");
const ranking_service_1 = require("./ranking.service");
const paginacao_ranking_dto_1 = require("./dto/paginacao-ranking.dto");
let RankingController = RankingController_1 = class RankingController {
    constructor(rankingService) {
        this.rankingService = rankingService;
        this.logger = new common_1.Logger(RankingController_1.name);
    }
    async getRankingGeral(paginacaoDto) {
        return this.rankingService.getRankingGeralPaginado(paginacaoDto);
    }
    async getRankingPorFilial(req) {
        const usuario = req.user;
        this.logger.log(`[GET /por-filial] [GERENTE] Solicitado por: ${usuario.id} (${usuario.email})`);
        return this.rankingService.getRankingFiliaisParaMatriz(usuario.id);
    }
};
exports.RankingController = RankingController;
__decorate([
    (0, common_1.Get)('geral'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [paginacao_ranking_dto_1.PaginacaoRankingDto]),
    __metadata("design:returntype", Promise)
], RankingController.prototype, "getRankingGeral", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('GERENTE'),
    (0, common_1.Get)('por-filial'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RankingController.prototype, "getRankingPorFilial", null);
exports.RankingController = RankingController = RankingController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ranking'),
    __metadata("design:paramtypes", [ranking_service_1.RankingService])
], RankingController);
//# sourceMappingURL=ranking.controller.js.map