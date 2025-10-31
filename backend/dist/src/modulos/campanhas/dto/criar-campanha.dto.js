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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriarCampanhaDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const criar_regra_cartela_dto_1 = require("./criar-regra-cartela.dto");
class CriarCampanhaDto {
}
exports.CriarCampanhaDto = CriarCampanhaDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'O título deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O título não pode estar vazio' }),
    __metadata("design:type", String)
], CriarCampanhaDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'A descrição deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'A descrição não pode estar vazia' }),
    __metadata("design:type", String)
], CriarCampanhaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'A data de início deve estar no formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CriarCampanhaDto.prototype, "dataInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'A data de término deve estar no formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CriarCampanhaDto.prototype, "dataFim", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'As moedinhas por cartela devem ser um número inteiro' }),
    (0, class_validator_1.Min)(0, { message: 'As moedinhas por cartela não podem ser negativas' }),
    __metadata("design:type", Number)
], CriarCampanhaDto.prototype, "moedinhasPorCartela", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Os pontos reais por cartela devem ser um número' }),
    (0, class_validator_1.Min)(0, { message: 'Os pontos reais por cartela não podem ser negativos' }),
    __metadata("design:type", Number)
], CriarCampanhaDto.prototype, "pontosReaisPorCartela", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'O percentual do gerente deve ser um número' }),
    (0, class_validator_1.Min)(0, { message: 'O percentual do gerente não pode ser negativo' }),
    (0, class_validator_1.Max)(1, { message: 'O percentual do gerente não pode ser maior que 1 (100%)' }),
    __metadata("design:type", Number)
], CriarCampanhaDto.prototype, "percentualGerente", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'As cartelas devem ser um array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => criar_regra_cartela_dto_1.CriarRegraCartelaDto),
    (0, class_validator_1.IsNotEmpty)({ message: 'A campanha deve ter pelo menos uma cartela' }),
    __metadata("design:type", Array)
], CriarCampanhaDto.prototype, "cartelas", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'O campo paraTodasOticas deve ser booleano.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CriarCampanhaDto.prototype, "paraTodasOticas", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => o.paraTodasOticas === false || o.paraTodasOticas === undefined),
    (0, class_validator_1.IsArray)({ message: 'oticasAlvoIds deve ser um array.' }),
    (0, class_validator_1.ArrayNotEmpty)({ message: 'Se a campanha não for para todas as óticas, ao menos uma ótica alvo deve ser especificada.' }),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Cada ID de ótica alvo deve ser um UUID válido.' }),
    __metadata("design:type", Array)
], CriarCampanhaDto.prototype, "oticasAlvoIds", void 0);
//# sourceMappingURL=criar-campanha.dto.js.map