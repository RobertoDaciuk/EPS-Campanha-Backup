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
var CampanhaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampanhaController = void 0;
const common_1 = require("@nestjs/common");
const campanha_service_1 = require("./campanha.service");
const criar_campanha_dto_1 = require("./dto/criar-campanha.dto");
const atualizar_campanha_dto_1 = require("./dto/atualizar-campanha.dto");
const jwt_auth_guard_1 = require("../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("../comum/guards/papeis.guard");
const papeis_decorator_1 = require("../comum/decorators/papeis.decorator");
let CampanhaController = CampanhaController_1 = class CampanhaController {
    constructor(campanhaService) {
        this.campanhaService = campanhaService;
        this.logger = new common_1.Logger(CampanhaController_1.name);
    }
    async listar(req) {
        const usuario = req.user;
        this.logger.log(`[GET] Listando campanhas para usuário: ${usuario.id} (${usuario.email})`);
        return this.campanhaService.listar(usuario);
    }
    async criar(dto) {
        this.logger.log(`[POST] [ADMIN] Criando campanha: ${dto.titulo}`);
        return this.campanhaService.criar(dto);
    }
    async buscarPorId(id, req) {
        const usuario = req.user;
        this.logger.log(`[GET] Buscando campanha por ID: ${id} (usuário: ${usuario.email})`);
        return this.campanhaService.buscarPorId(id, usuario);
    }
    async atualizar(id, dto) {
        this.logger.log(`[PATCH] [ADMIN] Atualizando campanha: ${id}`);
        return this.campanhaService.atualizar(id, dto);
    }
    async remover(id, req) {
        this.logger.log(`[DELETE] [ADMIN] Removendo campanha: ${id}`);
        return this.campanhaService.remover(id, req.user);
    }
};
exports.CampanhaController = CampanhaController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "listar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('ADMIN'),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_campanha_dto_1.CriarCampanhaDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "criar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('ADMIN'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, atualizar_campanha_dto_1.AtualizarCampanhaDto]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "atualizar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampanhaController.prototype, "remover", null);
exports.CampanhaController = CampanhaController = CampanhaController_1 = __decorate([
    (0, common_1.Controller)('campanhas'),
    __metadata("design:paramtypes", [campanha_service_1.CampanhaService])
], CampanhaController);
//# sourceMappingURL=campanha.controller.js.map