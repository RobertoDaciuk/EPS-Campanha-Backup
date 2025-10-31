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
exports.CriarCondicaoRequisitoDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CriarCondicaoRequisitoDto {
}
exports.CriarCondicaoRequisitoDto = CriarCondicaoRequisitoDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.CampoVerificacao, {
        message: 'O campo deve ser um dos valores válidos: NOME_PRODUTO, CODIGO_PRODUTO, VALOR_VENDA, CATEGORIA_PRODUTO',
    }),
    __metadata("design:type", String)
], CriarCondicaoRequisitoDto.prototype, "campo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.OperadorCondicao, {
        message: 'O operador deve ser um dos valores válidos: CONTEM, NAO_CONTEM, IGUAL_A, NAO_IGUAL_A, MAIOR_QUE, MENOR_QUE',
    }),
    __metadata("design:type", String)
], CriarCondicaoRequisitoDto.prototype, "operador", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'O valor deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O valor não pode estar vazio' }),
    __metadata("design:type", String)
], CriarCondicaoRequisitoDto.prototype, "valor", void 0);
//# sourceMappingURL=criar-condicao-requisito.dto.js.map