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
exports.RelatorioFinanceiroController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("./../comum/guards/papeis.guard");
const papeis_decorator_1 = require("./../comum/decorators/papeis.decorator");
const client_1 = require("@prisma/client");
const relatorio_financeiro_service_1 = require("./relatorio-financeiro.service");
const listar_relatorios_filtro_dto_1 = require("./dto/listar-relatorios.filtro.dto");
let RelatorioFinanceiroController = class RelatorioFinanceiroController {
    constructor(relatorioService) {
        this.relatorioService = relatorioService;
    }
    async listar(filtros) {
        return this.relatorioService.listar(filtros);
    }
    async buscarPorId(id) {
        return this.relatorioService.buscarPorId(id);
    }
    async marcarComoPago(id) {
        return this.relatorioService.marcarComoPago(id);
    }
};
exports.RelatorioFinanceiroController = RelatorioFinanceiroController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listar_relatorios_filtro_dto_1.ListarRelatoriosFiltroDto]),
    __metadata("design:returntype", Promise)
], RelatorioFinanceiroController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RelatorioFinanceiroController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Patch)(':id/marcar-como-pago'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RelatorioFinanceiroController.prototype, "marcarComoPago", null);
exports.RelatorioFinanceiroController = RelatorioFinanceiroController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.Controller)('relatorios-financeiros'),
    __metadata("design:paramtypes", [relatorio_financeiro_service_1.RelatorioFinanceiroService])
], RelatorioFinanceiroController);
//# sourceMappingURL=relatorio-financeiro.controller.js.map