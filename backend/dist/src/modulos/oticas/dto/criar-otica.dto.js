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
exports.CriarOticaDto = void 0;
const class_validator_1 = require("class-validator");
class CriarOticaDto {
}
exports.CriarOticaDto = CriarOticaDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'O CNPJ deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O CNPJ é obrigatório' }),
    __metadata("design:type", String)
], CriarOticaDto.prototype, "cnpj", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'O nome deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome é obrigatório' }),
    __metadata("design:type", String)
], CriarOticaDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O endereço deve ser uma string' }),
    __metadata("design:type", String)
], CriarOticaDto.prototype, "endereco", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'A cidade deve ser uma string' }),
    __metadata("design:type", String)
], CriarOticaDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O estado deve ser uma string' }),
    (0, class_validator_1.Length)(2, 2, { message: 'O estado deve ter exatamente 2 caracteres (UF)' }),
    __metadata("design:type", String)
], CriarOticaDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O telefone deve ser uma string' }),
    __metadata("design:type", String)
], CriarOticaDto.prototype, "telefone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'O email deve ser válido' }),
    __metadata("design:type", String)
], CriarOticaDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'ehMatriz deve ser um booleano (true/false)' }),
    __metadata("design:type", Boolean)
], CriarOticaDto.prototype, "ehMatriz", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'O ID da matriz deve ser um UUID válido' }),
    __metadata("design:type", String)
], CriarOticaDto.prototype, "matrizId", void 0);
//# sourceMappingURL=criar-otica.dto.js.map