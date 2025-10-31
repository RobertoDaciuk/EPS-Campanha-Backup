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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("./../comum/guards/papeis.guard");
const papeis_decorator_1 = require("./../comum/decorators/papeis.decorator");
const client_1 = require("@prisma/client");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getVendedorDashboard(req) {
        return this.dashboardService.getVendedorKpis(req.user.id);
    }
    async getGerenteDashboard(req) {
        return this.dashboardService.getGerenteKpis(req.user.id);
    }
    async getAdminDashboard() {
        return this.dashboardService.getAdminKpis();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('vendedor'),
    (0, common_1.UseGuards)(papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.VENDEDOR),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getVendedorDashboard", null);
__decorate([
    (0, common_1.Get)('gerente'),
    (0, common_1.UseGuards)(papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.GERENTE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getGerenteDashboard", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAdminDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map