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
exports.ResgateController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("./../comum/guards/papeis.guard");
const papeis_decorator_1 = require("./../comum/decorators/papeis.decorator");
const client_1 = require("@prisma/client");
const resgate_service_1 = require("./resgate.service");
const solicitar_resgate_dto_1 = require("./dto/solicitar-resgate.dto");
const listar_resgates_filtro_dto_1 = require("./dto/listar-resgates.filtro.dto");
const cancelar_resgate_dto_1 = require("./dto/cancelar-resgate.dto");
let ResgateController = class ResgateController {
    constructor(resgateService) {
        this.resgateService = resgateService;
    }
    async solicitar(dto, req) {
        const vendedorId = req.user.id;
        return this.resgateService.solicitar(dto, vendedorId);
    }
    async meusResgates(req) {
        const vendedorId = req.user.id;
        return this.resgateService.meusResgates(vendedorId);
    }
    async listarAdmin(filtros) {
        return this.resgateService.listarAdmin(filtros);
    }
    async marcarEnviado(id) {
        return this.resgateService.marcarEnviado(id);
    }
    async cancelarEstorno(id, dto) {
        return this.resgateService.cancelarEstorno(id, dto);
    }
};
exports.ResgateController = ResgateController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.VENDEDOR),
    (0, common_1.Post)('solicitar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [solicitar_resgate_dto_1.SolicitarResgateDto, Object]),
    __metadata("design:returntype", Promise)
], ResgateController.prototype, "solicitar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.VENDEDOR),
    (0, common_1.Get)('meus-resgates'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResgateController.prototype, "meusResgates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listar_resgates_filtro_dto_1.ListarResgatesFiltroDto]),
    __metadata("design:returntype", Promise)
], ResgateController.prototype, "listarAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.Patch)(':id/marcar-enviado'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResgateController.prototype, "marcarEnviado", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.Patch)(':id/cancelar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancelar_resgate_dto_1.CancelarResgateDto]),
    __metadata("design:returntype", Promise)
], ResgateController.prototype, "cancelarEstorno", null);
exports.ResgateController = ResgateController = __decorate([
    (0, common_1.Controller)('resgates'),
    __metadata("design:paramtypes", [resgate_service_1.ResgateService])
], ResgateController);
//# sourceMappingURL=resgate.controller.js.map