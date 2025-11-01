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
exports.CriarRequisitoCartelaDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const criar_condicao_requisito_dto_1 = require("./criar-condicao-requisito.dto");
class CriarRequisitoCartelaDto {
}
exports.CriarRequisitoCartelaDto = CriarRequisitoCartelaDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.trim().replace(/<[^>]*>/g, '').replace(/&/g, '&amp;');
        }
        return value;
    }),
    (0, class_validator_1.IsString)({ message: 'A descrição deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'A descrição não pode estar vazia' }),
    __metadata("design:type", String)
], CriarRequisitoCartelaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'A quantidade deve ser um número inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'A quantidade deve ser no mínimo 1' }),
    __metadata("design:type", Number)
], CriarRequisitoCartelaDto.prototype, "quantidade", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TipoUnidade, {
        message: 'O tipo de unidade deve ser PAR ou UNIDADE',
    }),
    __metadata("design:type", String)
], CriarRequisitoCartelaDto.prototype, "tipoUnidade", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'A ordem deve ser um número inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'A ordem deve ser no mínimo 1' }),
    __metadata("design:type", Number)
], CriarRequisitoCartelaDto.prototype, "ordem", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'As condições devem ser um array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => criar_condicao_requisito_dto_1.CriarCondicaoRequisitoDto),
    (0, class_validator_1.IsNotEmpty)({ message: 'O requisito deve ter pelo menos uma condição' }),
    __metadata("design:type", Array)
], CriarRequisitoCartelaDto.prototype, "condicoes", void 0);
//# sourceMappingURL=criar-requisito-cartela.dto.js.map