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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremioController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("./../comum/guards/papeis.guard");
const papeis_decorator_1 = require("./../comum/decorators/papeis.decorator");
const client_1 = require("@prisma/client");
const premio_service_1 = require("./premio.service");
const criar_premio_dto_1 = require("./dto/criar-premio.dto");
const atualizar_premio_dto_1 = require("./dto/atualizar-premio.dto");
const platform_express_1 = require("@nestjs/platform-express");
let PremioController = class PremioController {
    constructor(premioService) {
        this.premioService = premioService;
    }
    async listar() {
        return this.premioService.listar();
    }
    async buscarPorId(id) {
        return this.premioService.buscarPorId(id);
    }
    async listarTodosAdmin() {
        return this.premioService.listarTodosAdmin();
    }
    async criar(dto) {
        return this.premioService.criar(dto);
    }
    async atualizar(id, dto) {
        return this.premioService.atualizar(id, dto);
    }
    async remover(id) {
        return this.premioService.remover(id);
    }
    async uploadImagem(id, file) {
        return this.premioService.uploadImagem(id, file);
    }
};
exports.PremioController = PremioController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PremioController.prototype, "listar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PremioController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.Get)('admin/todos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PremioController.prototype, "listarTodosAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_premio_dto_1.CriarPremioDto]),
    __metadata("design:returntype", Promise)
], PremioController.prototype, "criar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, atualizar_premio_dto_1.AtualizarPremioDto]),
    __metadata("design:returntype", Promise)
], PremioController.prototype, "atualizar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PremioController.prototype, "remover", null);
__decorate([
    (0, common_1.Post)(':id/upload-imagem'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('ADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PremioController.prototype, "uploadImagem", null);
exports.PremioController = PremioController = __decorate([
    (0, common_1.Controller)('premios'),
    __metadata("design:paramtypes", [premio_service_1.PremioService])
], PremioController);
//# sourceMappingURL=premio.controller.js.map