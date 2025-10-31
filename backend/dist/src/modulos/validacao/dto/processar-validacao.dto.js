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
exports.ProcessarValidacaoDto = void 0;
const class_validator_1 = require("class-validator");
function IsMapaComCnpj(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isMapaComCnpj',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (typeof value !== 'object' || value === null) {
                        return false;
                    }
                    const valores = Object.values(value);
                    return valores.includes('CNPJ_OTICA');
                },
                defaultMessage(args) {
                    return 'O mapaColunas deve ser um objeto e conter um mapeamento para "CNPJ_OTICA".';
                },
            },
        });
    };
}
class ProcessarValidacaoDto {
}
exports.ProcessarValidacaoDto = ProcessarValidacaoDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'O ID da campanha deve ser UUID válido' }),
    __metadata("design:type", String)
], ProcessarValidacaoDto.prototype, "campanhaId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'ehSimulacao deve ser booleano' }),
    __metadata("design:type", Boolean)
], ProcessarValidacaoDto.prototype, "ehSimulacao", void 0);
__decorate([
    (0, class_validator_1.IsDefined)({ message: 'O mapaColunas é obrigatório.' }),
    IsMapaComCnpj({
        message: 'O mapaColunas é obrigatório e deve incluir um mapeamento para "CNPJ_OTICA".',
    }),
    __metadata("design:type", Object)
], ProcessarValidacaoDto.prototype, "mapaColunas", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'linhasPlanilha deve ser um array' }),
    __metadata("design:type", Array)
], ProcessarValidacaoDto.prototype, "linhasPlanilha", void 0);
//# sourceMappingURL=processar-validacao.dto.js.map