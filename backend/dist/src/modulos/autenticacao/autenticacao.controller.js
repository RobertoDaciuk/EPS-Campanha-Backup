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
exports.AutenticacaoController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const autenticacao_service_1 = require("./autenticacao.service");
const registrar_usuario_dto_1 = require("./dto/registrar-usuario.dto");
const login_dto_1 = require("./dto/login.dto");
const resetar_senha_dto_1 = require("./dto/resetar-senha.dto");
const public_decorator_1 = require("../comum/decorators/public.decorator");
let AutenticacaoController = class AutenticacaoController {
    constructor(autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }
    async registrar(dados, req) {
        return this.autenticacaoService.registrar(dados, req);
    }
    async login(dados, req) {
        return this.autenticacaoService.login(dados, req);
    }
    async resetarSenha(dados, req) {
        return this.autenticacaoService.resetarSenha(dados, req);
    }
};
exports.AutenticacaoController = AutenticacaoController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('registrar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registrar_usuario_dto_1.RegistrarUsuarioDto, Object]),
    __metadata("design:returntype", Promise)
], AutenticacaoController.prototype, "registrar", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AutenticacaoController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, common_1.Post)('resetar-senha'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resetar_senha_dto_1.ResetarSenhaDto, Object]),
    __metadata("design:returntype", Promise)
], AutenticacaoController.prototype, "resetarSenha", null);
exports.AutenticacaoController = AutenticacaoController = __decorate([
    (0, common_1.Controller)('autenticacao'),
    __metadata("design:paramtypes", [autenticacao_service_1.AutenticacaoService])
], AutenticacaoController);
//# sourceMappingURL=autenticacao.controller.js.map