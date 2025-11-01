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
exports.RejeitarManualDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RejeitarManualDto {
}
exports.RejeitarManualDto = RejeitarManualDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.trim().replace(/<[^>]*>/g, '').replace(/&/g, '&amp;');
        }
        return value;
    }),
    (0, class_validator_1.IsString)({ message: 'O motivo deve ser uma string.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O motivo não pode estar vazio.' }),
    (0, class_validator_1.MinLength)(5, { message: 'O motivo deve ter pelo menos 5 caracteres.' }),
    (0, class_validator_1.MaxLength)(500, { message: 'O motivo não pode exceder 500 caracteres.' }),
    __metadata("design:type", String)
], RejeitarManualDto.prototype, "motivoRejeicao", void 0);
//# sourceMappingURL=rejeitar-manual.dto.js.map