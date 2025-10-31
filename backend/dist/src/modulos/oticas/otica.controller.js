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
var OticaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OticaController = void 0;
const common_1 = require("@nestjs/common");
const otica_service_1 = require("./otica.service");
const jwt_auth_guard_1 = require("./../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("./../comum/guards/papeis.guard");
const papeis_decorator_1 = require("./../comum/decorators/papeis.decorator");
const client_1 = require("@prisma/client");
const criar_otica_dto_1 = require("./dto/criar-otica.dto");
const atualizar_otica_dto_1 = require("./dto/atualizar-otica.dto");
const listar_oticas_filtro_dto_1 = require("./dto/listar-oticas.filtro.dto");
let OticaController = OticaController_1 = class OticaController {
    constructor(oticaService) {
        this.oticaService = oticaService;
        this.logger = new common_1.Logger(OticaController_1.name);
    }
    async verificarCnpj(cnpj) {
        this.logger.log(`[PÚBLICO] Verificando CNPJ: ${cnpj}`);
        const optica = await this.oticaService.buscarPorCnpjPublico(cnpj);
        return optica;
    }
    async listarTudo() {
        this.logger.log('[ADMIN] Listando todas as óticas');
        const oticas = await this.oticaService.listarTudo();
        return oticas;
    }
    async buscarPorId(id) {
        this.logger.log(`[ADMIN] Buscando ótica por ID: ${id}`);
        const optica = await this.oticaService.buscarPorId(id);
        return optica;
    }
    async listarAdmin(filtros) {
        this.logger.log(`ADMIN: Listando óticas (filtros: ${JSON.stringify(filtros)})`);
        return await this.oticaService.listarAdmin(filtros);
    }
    async criar(dto) {
        this.logger.log(`ADMIN: Criando ótica: ${dto.nome}`);
        return await this.oticaService.criar(dto);
    }
    async buscarPorIdAdmin(id) {
        this.logger.log(`ADMIN: Buscando ótica por ID: ${id}`);
        return await this.oticaService.buscarPorIdAdmin(id);
    }
    async atualizar(id, dto) {
        this.logger.log(`ADMIN: Atualizando ótica (ID: ${id})`);
        return await this.oticaService.atualizar(id, dto);
    }
    async desativar(id) {
        this.logger.log(`ADMIN: Desativando ótica (ID: ${id})`);
        return await this.oticaService.desativar(id);
    }
    async reativar(id) {
        this.logger.log(`ADMIN: Reativando ótica (ID: ${id})`);
        return await this.oticaService.reativar(id);
    }
};
exports.OticaController = OticaController;
__decorate([
    (0, common_1.Get)('verificar-cnpj/:cnpj'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('cnpj')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "verificarCnpj", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "listarTudo", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listar_oticas_filtro_dto_1.ListarOticasFiltroDto]),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "listarAdmin", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_otica_dto_1.CriarOticaDto]),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "buscarPorIdAdmin", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, atualizar_otica_dto_1.AtualizarOticaDto]),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Patch)(':id/desativar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "desativar", null);
__decorate([
    (0, common_1.Patch)(':id/reativar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)(client_1.PapelUsuario.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OticaController.prototype, "reativar", null);
exports.OticaController = OticaController = OticaController_1 = __decorate([
    (0, common_1.Controller)('oticas'),
    __metadata("design:paramtypes", [otica_service_1.OticaService])
], OticaController);
//# sourceMappingURL=otica.controller.js.map