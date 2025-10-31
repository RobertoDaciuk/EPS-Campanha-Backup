"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremioModule = void 0;
const common_1 = require("@nestjs/common");
const premio_controller_1 = require("./premio.controller");
const premio_service_1 = require("./premio.service");
const upload_module_1 = require("../upload/upload.module");
let PremioModule = class PremioModule {
};
exports.PremioModule = PremioModule;
exports.PremioModule = PremioModule = __decorate([
    (0, common_1.Module)({
        imports: [upload_module_1.UploadModule],
        controllers: [premio_controller_1.PremioController],
        providers: [premio_service_1.PremioService],
    })
], PremioModule);
//# sourceMappingURL=premio.module.js.map