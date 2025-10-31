"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ArmazenamentoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmazenamentoService = void 0;
const common_1 = require("@nestjs/common");
let ArmazenamentoService = ArmazenamentoService_1 = class ArmazenamentoService {
    constructor() {
        this.logger = new common_1.Logger(ArmazenamentoService_1.name);
    }
    async uploadArquivo(buffer, mimetype, pastaDestino, nomeBaseArquivo) {
        const extensao = mimetype.split('/')[1] ?? 'png';
        const nomeArquivo = `${pastaDestino}/${nomeBaseArquivo}-${Date.now()}.${extensao}`;
        this.logger.log(`[ARMAZENAMENTO DUMMY] Simulating upload for: ${nomeArquivo}, Size: ${buffer.length} bytes`);
        return `https://storage.googleapis.com/eps-campanhas-fake-bucket/${nomeArquivo}`;
    }
    async uploadAvatar(fileBuffer, mimetype, usuarioId) {
        return this.uploadArquivo(fileBuffer, mimetype, 'avatars', usuarioId);
    }
};
exports.ArmazenamentoService = ArmazenamentoService;
exports.ArmazenamentoService = ArmazenamentoService = ArmazenamentoService_1 = __decorate([
    (0, common_1.Injectable)()
], ArmazenamentoService);
//# sourceMappingURL=armazenamento.service.js.map