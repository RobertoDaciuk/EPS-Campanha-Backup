"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResgateModule = void 0;
const common_1 = require("@nestjs/common");
const resgate_controller_1 = require("./resgate.controller");
const resgate_service_1 = require("./resgate.service");
let ResgateModule = class ResgateModule {
};
exports.ResgateModule = ResgateModule;
exports.ResgateModule = ResgateModule = __decorate([
    (0, common_1.Module)({
        controllers: [resgate_controller_1.ResgateController],
        providers: [resgate_service_1.ResgateService],
    })
], ResgateModule);
//# sourceMappingURL=resgate.module.js.map