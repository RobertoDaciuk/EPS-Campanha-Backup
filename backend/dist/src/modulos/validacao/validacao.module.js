"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidacaoModule = void 0;
const common_1 = require("@nestjs/common");
const validacao_service_1 = require("./validacao.service");
const validacao_controller_1 = require("./validacao.controller");
const recompensa_module_1 = require("../recompensa/recompensa.module");
let ValidacaoModule = class ValidacaoModule {
};
exports.ValidacaoModule = ValidacaoModule;
exports.ValidacaoModule = ValidacaoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            recompensa_module_1.RecompensaModule,
        ],
        controllers: [validacao_controller_1.ValidacaoController],
        providers: [validacao_service_1.ValidacaoService],
        exports: [],
    })
], ValidacaoModule);
//# sourceMappingURL=validacao.module.js.map