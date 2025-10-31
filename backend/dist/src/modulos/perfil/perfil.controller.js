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
exports.PerfilController = void 0;
const common_1 = require("@nestjs/common");
const perfil_service_1 = require("./perfil.service");
const atualizar_perfil_dto_1 = require("./dto/atualizar-perfil.dto");
const atualizar_senha_dto_1 = require("./dto/atualizar-senha.dto");
const jwt_auth_guard_1 = require("./../comum/guards/jwt-auth.guard");
let PerfilController = class PerfilController {
    constructor(perfilService) {
        this.perfilService = perfilService;
    }
    getUsuarioId(req) {
        return req.user.id;
    }
    async meuPerfil(req) {
        return await this.perfilService.meuPerfil(this.getUsuarioId(req));
    }
    async atualizarMeuPerfil(req, dto) {
        return await this.perfilService.atualizarMeuPerfil(this.getUsuarioId(req), dto);
    }
    async atualizarMinhaSenha(req, dto) {
        return await this.perfilService.atualizarSenha(this.getUsuarioId(req), dto);
    }
};
exports.PerfilController = PerfilController;
__decorate([
    (0, common_1.Get)('meu'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerfilController.prototype, "meuPerfil", null);
__decorate([
    (0, common_1.Patch)('meu'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, atualizar_perfil_dto_1.AtualizarPerfilDto]),
    __metadata("design:returntype", Promise)
], PerfilController.prototype, "atualizarMeuPerfil", null);
__decorate([
    (0, common_1.Patch)('minha-senha'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, atualizar_senha_dto_1.AtualizarSenhaDto]),
    __metadata("design:returntype", Promise)
], PerfilController.prototype, "atualizarMinhaSenha", null);
exports.PerfilController = PerfilController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('perfil'),
    __metadata("design:paramtypes", [perfil_service_1.PerfilService])
], PerfilController);
//# sourceMappingURL=perfil.controller.js.map