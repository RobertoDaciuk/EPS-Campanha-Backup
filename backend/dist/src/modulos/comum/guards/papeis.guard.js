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
exports.PapeisGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const papeis_decorator_1 = require("../decorators/papeis.decorator");
let PapeisGuard = class PapeisGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const papeisNecessarios = this.reflector.getAllAndOverride(papeis_decorator_1.PAPEIS_CHAVE, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!papeisNecessarios) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return papeisNecessarios.some((papel) => user?.papel === papel);
    }
};
exports.PapeisGuard = PapeisGuard;
exports.PapeisGuard = PapeisGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PapeisGuard);
//# sourceMappingURL=papeis.guard.js.map