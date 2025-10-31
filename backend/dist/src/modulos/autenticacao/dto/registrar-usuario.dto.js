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
exports.RegistrarUsuarioDto = void 0;
const class_validator_1 = require("class-validator");
class RegistrarUsuarioDto {
}
exports.RegistrarUsuarioDto = RegistrarUsuarioDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'O nome deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome é obrigatório' }),
    __metadata("design:type", String)
], RegistrarUsuarioDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'O email deve ser válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O email é obrigatório' }),
    __metadata("design:type", String)
], RegistrarUsuarioDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'O CPF deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O CPF é obrigatório' }),
    __metadata("design:type", String)
], RegistrarUsuarioDto.prototype, "cpf", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'A senha deve ser uma string' }),
    (0, class_validator_1.MinLength)(8, { message: 'A senha deve ter no mínimo 8 caracteres' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/, {
        message: 'A senha deve conter pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial (@$!%*?&#)',
    }),
    __metadata("design:type", String)
], RegistrarUsuarioDto.prototype, "senha", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'O ID da ótica deve ser um UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O ID da ótica é obrigatório' }),
    __metadata("design:type", String)
], RegistrarUsuarioDto.prototype, "opticaId", void 0);
//# sourceMappingURL=registrar-usuario.dto.js.map