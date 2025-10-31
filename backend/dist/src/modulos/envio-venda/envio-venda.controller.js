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
exports.EnvioVendaController = void 0;
const common_1 = require("@nestjs/common");
const envio_venda_service_1 = require("./envio-venda.service");
const criar_envio_venda_dto_1 = require("./dto/criar-envio-venda.dto");
const listar_envios_filtro_dto_1 = require("./dto/listar-envios-filtro.dto");
const listar_minhas_envio_venda_dto_1 = require("./dto/listar-minhas-envio-venda.dto");
const rejeitar_manual_dto_1 = require("./dto/rejeitar-manual.dto");
const jwt_auth_guard_1 = require("../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("../comum/guards/papeis.guard");
const papeis_decorator_1 = require("../comum/decorators/papeis.decorator");
let EnvioVendaController = class EnvioVendaController {
    constructor(envioVendaService) {
        this.envioVendaService = envioVendaService;
    }
    async criar(dto, req) {
        return this.envioVendaService.criar(dto, req.user.id);
    }
    async listar(req, filtros) {
        return this.envioVendaService.listar(req.user, filtros);
    }
    async listarMinhas(req, query) {
        const vendedorId = req.user.id;
        return this.envioVendaService.listarMinhasPorCampanha(vendedorId, query.campanhaId);
    }
    async validarManual(id) {
        return this.envioVendaService.validarManual(id);
    }
    async rejeitarManual(id, dto) {
        return this.envioVendaService.rejeitarManual(id, dto);
    }
};
exports.EnvioVendaController = EnvioVendaController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('VENDEDOR'),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_envio_venda_dto_1.CriarEnvioVendaDto, Object]),
    __metadata("design:returntype", Promise)
], EnvioVendaController.prototype, "criar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, listar_envios_filtro_dto_1.ListarEnviosFiltroDto]),
    __metadata("design:returntype", Promise)
], EnvioVendaController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('minhas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('VENDEDOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, listar_minhas_envio_venda_dto_1.ListarMinhasEnvioVendaDto]),
    __metadata("design:returntype", Promise)
], EnvioVendaController.prototype, "listarMinhas", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('ADMIN'),
    (0, common_1.Patch)(':id/validar-manual'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnvioVendaController.prototype, "validarManual", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('ADMIN'),
    (0, common_1.Patch)(':id/rejeitar-manual'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rejeitar_manual_dto_1.RejeitarManualDto]),
    __metadata("design:returntype", Promise)
], EnvioVendaController.prototype, "rejeitarManual", null);
exports.EnvioVendaController = EnvioVendaController = __decorate([
    (0, common_1.Controller)('envios-venda'),
    __metadata("design:paramtypes", [envio_venda_service_1.EnvioVendaService])
], EnvioVendaController);
//# sourceMappingURL=envio-venda.controller.js.map