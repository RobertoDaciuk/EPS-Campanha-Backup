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
var UsuarioController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const common_1 = require("@nestjs/common");
const usuario_service_1 = require("./usuario.service");
const criar_usuario_admin_dto_1 = require("./dto/criar-usuario-admin.dto");
const atualizar_usuario_dto_1 = require("./dto/atualizar-usuario.dto");
const listar_usuarios_filtro_dto_1 = require("./dto/listar-usuarios.filtro.dto");
const jwt_auth_guard_1 = require("../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("../comum/guards/papeis.guard");
const papeis_decorator_1 = require("../comum/decorators/papeis.decorator");
let UsuarioController = UsuarioController_1 = class UsuarioController {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
        this.logger = new common_1.Logger(UsuarioController_1.name);
    }
    async listar(filtros) {
        this.logger.log(`[ADMIN] Listando usuários - Filtros: ${JSON.stringify(filtros)}`);
        return await this.usuarioService.listar(filtros);
    }
    async criar(dados) {
        this.logger.log(`[ADMIN] Criando usuário: ${dados.email}`);
        const resultado = await this.usuarioService.criarAdmin(dados);
        return resultado;
    }
    async buscarPorId(id) {
        this.logger.log(`[ADMIN] Buscando usuário: ${id}`);
        return await this.usuarioService.buscarPorId(id);
    }
    async atualizar(id, dados) {
        this.logger.log(`[ADMIN] Atualizando usuário: ${id}`);
        return await this.usuarioService.atualizar(id, dados);
    }
    async remover(id) {
        this.logger.log(`[ADMIN] Removendo usuário: ${id}`);
        return await this.usuarioService.remover(id);
    }
    async aprovar(id) {
        this.logger.log(`[ADMIN] Aprovando usuário: ${id}`);
        const usuario = await this.usuarioService.aprovar(id);
        return {
            message: `Usuário ${usuario.nome} aprovado com sucesso!`,
            usuario,
        };
    }
    async bloquear(id) {
        this.logger.log(`[ADMIN] Bloqueando usuário: ${id}`);
        const usuario = await this.usuarioService.bloquear(id);
        return {
            message: `Usuário ${usuario.nome} bloqueado com sucesso!`,
            usuario,
        };
    }
    async desbloquear(id) {
        this.logger.log(`[ADMIN] Desbloqueando usuário: ${id}`);
        const usuario = await this.usuarioService.desbloquear(id);
        return {
            message: `Usuário ${usuario.nome} desbloqueado com sucesso!`,
            usuario,
        };
    }
    async personificar(id, req) {
        const admin = req.user;
        this.logger.log(`[ADMIN] Impersonação solicitada: ${admin.email} → Usuário ${id}`);
        const token = await this.usuarioService.personificar(admin.id, id);
        return token;
    }
    async iniciarResetSenha(id) {
        this.logger.log(`[ADMIN] Iniciando reset de senha para usuário: ${id}`);
        return await this.usuarioService.iniciarResetSenhaAdmin(id);
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [listar_usuarios_filtro_dto_1.ListarUsuariosFiltroDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_usuario_admin_dto_1.CriarUsuarioAdminDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, atualizar_usuario_dto_1.AtualizarUsuarioDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "remover", null);
__decorate([
    (0, common_1.Patch)(':id/aprovar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "aprovar", null);
__decorate([
    (0, common_1.Patch)(':id/bloquear'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "bloquear", null);
__decorate([
    (0, common_1.Patch)(':id/desbloquear'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "desbloquear", null);
__decorate([
    (0, common_1.Post)(':id/personificar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "personificar", null);
__decorate([
    (0, common_1.Post)(':id/iniciar-reset-senha'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "iniciarResetSenha", null);
exports.UsuarioController = UsuarioController = UsuarioController_1 = __decorate([
    (0, common_1.Controller)('usuarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    (0, papeis_decorator_1.Papeis)('ADMIN'),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService])
], UsuarioController);
//# sourceMappingURL=usuario.controller.js.map