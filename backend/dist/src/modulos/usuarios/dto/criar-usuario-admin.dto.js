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
exports.CriarUsuarioAdminDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CriarUsuarioAdminDto {
}
exports.CriarUsuarioAdminDto = CriarUsuarioAdminDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'O email deve ser válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O email é obrigatório' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'O nome deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome é obrigatório' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'A senha deve ser uma string' }),
    (0, class_validator_1.MinLength)(8, { message: 'A senha deve ter no mínimo 8 caracteres' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "senha", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.PapelUsuario, { message: 'Papel inválido' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "papel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O CPF deve ser uma string' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "cpf", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'O WhatsApp deve ser uma string' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "whatsapp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.StatusUsuario, { message: 'Status inválido' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'O ID da ótica deve ser um UUID válido' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "opticaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'O ID do gerente deve ser um UUID válido' }),
    __metadata("design:type", String)
], CriarUsuarioAdminDto.prototype, "gerenteId", void 0);
//# sourceMappingURL=criar-usuario-admin.dto.js.map