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
var ValidacaoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidacaoController = void 0;
const common_1 = require("@nestjs/common");
const validacao_service_1 = require("./validacao.service");
const processar_validacao_dto_1 = require("./dto/processar-validacao.dto");
const jwt_auth_guard_1 = require("../comum/guards/jwt-auth.guard");
const papeis_guard_1 = require("../comum/guards/papeis.guard");
const papeis_decorator_1 = require("../comum/decorators/papeis.decorator");
let ValidacaoController = ValidacaoController_1 = class ValidacaoController {
    constructor(validacaoService) {
        this.validacaoService = validacaoService;
        this.logger = new common_1.Logger(ValidacaoController_1.name);
    }
    async processarPlanilha(dto) {
        this.logger.log(`[POST /api/validacao/processar] Iniciando processamento. Campanha: ${dto.campanhaId}, Simulação: ${dto.ehSimulacao}`);
        try {
            const resultado = await this.validacaoService.processarPlanilha(dto);
            this.logger.log(`[POST /api/validacao/processar] Processamento concluído. Total: ${resultado.totalProcessados}, Validados: ${resultado.validado}, Rejeitados: ${resultado.rejeitado}, Conflitos: ${resultado.conflito_manual}`);
            return resultado;
        }
        catch (erro) {
            this.logger.error(`[POST /api/validacao/processar] Erro durante processamento: ${erro.message}`, erro.stack);
            throw erro;
        }
    }
};
exports.ValidacaoController = ValidacaoController;
__decorate([
    (0, common_1.Post)('processar'),
    (0, papeis_decorator_1.Papeis)('ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [processar_validacao_dto_1.ProcessarValidacaoDto]),
    __metadata("design:returntype", Promise)
], ValidacaoController.prototype, "processarPlanilha", null);
exports.ValidacaoController = ValidacaoController = ValidacaoController_1 = __decorate([
    (0, common_1.Controller)('validacao'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, papeis_guard_1.PapeisGuard),
    __metadata("design:paramtypes", [validacao_service_1.ValidacaoService])
], ValidacaoController);
//# sourceMappingURL=validacao.controller.js.map