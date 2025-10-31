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
exports.NotificacaoController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./../comum/guards/jwt-auth.guard");
const notificacao_service_1 = require("./notificacao.service");
let NotificacaoController = class NotificacaoController {
    constructor(notificacaoService) {
        this.notificacaoService = notificacaoService;
    }
    getUsuarioId(req) {
        return req.user.id;
    }
    async listar(req) {
        return this.notificacaoService.listar(this.getUsuarioId(req));
    }
    async contagemNaoLidas(req) {
        return this.notificacaoService.contagemNaoLidas(this.getUsuarioId(req));
    }
    async marcarComoLida(id, req) {
        return this.notificacaoService.marcarComoLida(id, this.getUsuarioId(req));
    }
    async marcarTodasComoLidas(req) {
        return this.notificacaoService.marcarTodasComoLidas(this.getUsuarioId(req));
    }
};
exports.NotificacaoController = NotificacaoController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificacaoController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('contagem-nao-lidas'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificacaoController.prototype, "contagemNaoLidas", null);
__decorate([
    (0, common_1.Patch)(':id/marcar-como-lida'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificacaoController.prototype, "marcarComoLida", null);
__decorate([
    (0, common_1.Patch)('marcar-todas-como-lidas'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificacaoController.prototype, "marcarTodasComoLidas", null);
exports.NotificacaoController = NotificacaoController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notificacoes'),
    __metadata("design:paramtypes", [notificacao_service_1.NotificacaoService])
], NotificacaoController);
//# sourceMappingURL=notificacao.controller.js.map