"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvioVendaModule = void 0;
const common_1 = require("@nestjs/common");
const envio_venda_service_1 = require("./envio-venda.service");
const envio_venda_controller_1 = require("./envio-venda.controller");
const recompensa_module_1 = require("../recompensa/recompensa.module");
let EnvioVendaModule = class EnvioVendaModule {
};
exports.EnvioVendaModule = EnvioVendaModule;
exports.EnvioVendaModule = EnvioVendaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            recompensa_module_1.RecompensaModule,
        ],
        controllers: [envio_venda_controller_1.EnvioVendaController],
        providers: [envio_venda_service_1.EnvioVendaService],
        exports: [],
    })
], EnvioVendaModule);
//# sourceMappingURL=envio-venda.module.js.map