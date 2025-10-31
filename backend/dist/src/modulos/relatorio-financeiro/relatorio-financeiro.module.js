"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioFinanceiroModule = void 0;
const common_1 = require("@nestjs/common");
const relatorio_financeiro_controller_1 = require("./relatorio-financeiro.controller");
const relatorio_financeiro_service_1 = require("./relatorio-financeiro.service");
let RelatorioFinanceiroModule = class RelatorioFinanceiroModule {
};
exports.RelatorioFinanceiroModule = RelatorioFinanceiroModule;
exports.RelatorioFinanceiroModule = RelatorioFinanceiroModule = __decorate([
    (0, common_1.Module)({
        controllers: [relatorio_financeiro_controller_1.RelatorioFinanceiroController],
        providers: [relatorio_financeiro_service_1.RelatorioFinanceiroService],
    })
], RelatorioFinanceiroModule);
//# sourceMappingURL=relatorio-financeiro.module.js.map