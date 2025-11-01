"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfilService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let PerfilService = class PerfilService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async meuPerfil(usuarioId) {
        return this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                avatarUrl: true,
                papel: true,
                status: true,
                nivel: true,
                saldoMoedinhas: true,
                rankingMoedinhas: true,
                whatsapp: true,
                mapeamentoPlanilhaSalvo: true,
                criadoEm: true,
                atualizadoEm: true,
                optica: {
                    select: {
                        nome: true,
                        cnpj: true,
                    },
                },
            },
        });
    }
    async atualizarMeuPerfil(usuarioId, dto) {
        const data = {};
        if (dto.nome !== undefined) {
            data.nome = dto.nome;
        }
        if (dto.cpf !== undefined) {
            data.cpf = dto.cpf;
        }
        if (dto.whatsapp !== undefined) {
            data.whatsapp = dto.whatsapp;
        }
        if (dto.mapeamentoPlanilhaSalvo !== undefined) {
            data.mapeamentoPlanilhaSalvo = dto.mapeamentoPlanilhaSalvo;
        }
        return this.prisma.usuario.update({
            where: { id: usuarioId },
            data: data,
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                avatarUrl: true,
                papel: true,
                status: true,
                nivel: true,
                saldoMoedinhas: true,
                rankingMoedinhas: true,
                whatsapp: true,
                mapeamentoPlanilhaSalvo: true,
                criadoEm: true,
                atualizadoEm: true,
            },
        });
    }
    async atualizarSenha(usuarioId, dto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: { senhaHash: true },
        });
        const senhaValida = await bcrypt.compare(dto.senhaAtual, usuario.senhaHash);
        if (!senhaValida) {
            throw new common_1.UnauthorizedException('A senha atual está incorreta.');
        }
        const novaSenhaHash = await bcrypt.hash(dto.novaSenha, 10);
        return this.prisma.$transaction(async (tx) => {
            const perfilAtualizado = await tx.usuario.update({
                where: { id: usuarioId },
                data: { senhaHash: novaSenhaHash },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    cpf: true,
                    avatarUrl: true,
                    papel: true,
                    status: true,
                    nivel: true,
                    saldoMoedinhas: true,
                    rankingMoedinhas: true,
                    whatsapp: true,
                    mapeamentoPlanilhaSalvo: true,
                    criadoEm: true,
                    atualizadoEm: true,
                },
            });
            return perfilAtualizado;
        });
    }
};
exports.PerfilService = PerfilService;
exports.PerfilService = PerfilService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerfilService);
//# sourceMappingURL=perfil.service.js.map