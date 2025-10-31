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
exports.CriarRegraCartelaDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const criar_requisito_cartela_dto_1 = require("./criar-requisito-cartela.dto");
class CriarRegraCartelaDto {
}
exports.CriarRegraCartelaDto = CriarRegraCartelaDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'O número da cartela deve ser um inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'O número da cartela deve ser no mínimo 1' }),
    __metadata("design:type", Number)
], CriarRegraCartelaDto.prototype, "numeroCartela", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'A descrição deve ser uma string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarRegraCartelaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Os requisitos devem ser um array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => criar_requisito_cartela_dto_1.CriarRequisitoCartelaDto),
    (0, class_validator_1.IsNotEmpty)({ message: 'A cartela deve ter pelo menos um requisito' }),
    __metadata("design:type", Array)
], CriarRegraCartelaDto.prototype, "requisitos", void 0);
//# sourceMappingURL=criar-regra-cartela.dto.js.map