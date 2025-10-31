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
var AutenticacaoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutenticacaoService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AutenticacaoService = AutenticacaoService_1 = class AutenticacaoService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AutenticacaoService_1.name);
        this.BCRYPT_SALT_ROUNDS = 10;
    }
    _limparCpf(cpf) {
        const cpfLimpo = cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            throw new common_1.BadRequestException(`CPF inválido. Deve conter exatamente 11 dígitos. Recebido: ${cpfLimpo.length} dígitos.`);
        }
        return cpfLimpo;
    }
    gerarToken(usuario) {
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            papel: usuario.papel,
        };
        const accessToken = this.jwtService.sign(payload);
        this.logger.log(`Token JWT gerado para usuário: ${usuario.email}`);
        return {
            accessToken,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel,
            },
        };
    }
    async registrar(dados) {
        this.logger.log(`Registrando novo vendedor: ${dados.email}`);
        const cpfLimpo = this._limparCpf(dados.cpf);
        const usuarioExistente = await this.prisma.usuario.findFirst({
            where: {
                OR: [{ email: dados.email }, { cpf: cpfLimpo }],
            },
        });
        if (usuarioExistente) {
            this.logger.warn(`Tentativa de cadastro duplicado: ${dados.email} ou CPF ${cpfLimpo}`);
            if (usuarioExistente.email === dados.email) {
                throw new common_1.ConflictException('Este email já está cadastrado');
            }
            else {
                throw new common_1.ConflictException('Este CPF já está cadastrado');
            }
        }
        const senhaHash = await bcrypt.hash(dados.senha, this.BCRYPT_SALT_ROUNDS);
        const usuario = await this.prisma.usuario.create({
            data: {
                nome: dados.nome,
                email: dados.email,
                cpf: cpfLimpo,
                senhaHash,
                opticaId: dados.opticaId,
                papel: 'VENDEDOR',
                status: 'PENDENTE',
            },
        });
        this.logger.log(`✅ Vendedor registrado com sucesso: ${usuario.nome} (ID: ${usuario.id}) - Status: PENDENTE`);
        return {
            message: 'Cadastro enviado com sucesso! Sua conta será ativada após aprovação do administrador.',
        };
    }
    async login(dados) {
        this.logger.log(`Tentativa de login: ${dados.email}`);
        const usuario = await this.prisma.usuario.findUnique({
            where: { email: dados.email },
        });
        if (!usuario) {
            this.logger.warn(`Tentativa de login com email inexistente: ${dados.email}`);
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const senhaValida = await bcrypt.compare(dados.senha, usuario.senhaHash);
        if (!senhaValida) {
            this.logger.warn(`Tentativa de login com senha incorreta: ${dados.email}`);
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (usuario.status === 'PENDENTE') {
            this.logger.warn(`Tentativa de login com conta pendente: ${dados.email} (ID: ${usuario.id})`);
            throw new common_1.UnauthorizedException('Sua conta está aguardando aprovação do administrador. Você receberá um email quando sua conta for ativada.');
        }
        if (usuario.status === 'BLOQUEADO') {
            this.logger.warn(`Tentativa de login com conta bloqueada: ${dados.email} (ID: ${usuario.id})`);
            throw new common_1.UnauthorizedException('Sua conta foi bloqueada. Entre em contato com o administrador para mais informações.');
        }
        if (usuario.status !== 'ATIVO') {
            this.logger.error(`Status desconhecido durante login: ${usuario.status} (User: ${dados.email})`);
            throw new common_1.UnauthorizedException('Status de conta inválido');
        }
        this.logger.log(`✅ Login bem-sucedido: ${usuario.nome} (${usuario.email}) - Papel: ${usuario.papel}`);
        return this.gerarToken({
            id: usuario.id,
            email: usuario.email,
            papel: usuario.papel,
            nome: usuario.nome,
        });
    }
    async resetarSenha(dados) {
        this.logger.log('Processando reset de senha');
        const tokenHash = crypto
            .createHash('sha256')
            .update(dados.token)
            .digest('hex');
        const usuario = await this.prisma.usuario.findUnique({
            where: { tokenResetarSenha: tokenHash },
        });
        if (!usuario) {
            this.logger.warn('Tentativa de reset com token inválido');
            throw new common_1.BadRequestException('Token de reset inválido ou já utilizado');
        }
        if (usuario.tokenResetarSenhaExpira < new Date()) {
            this.logger.warn(`Tentativa de reset com token expirado: ${usuario.email}`);
            throw new common_1.BadRequestException('Token de reset expirado. Solicite um novo token ao administrador.');
        }
        const senhaHash = await bcrypt.hash(dados.novaSenha, this.BCRYPT_SALT_ROUNDS);
        await this.prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                senhaHash,
                tokenResetarSenha: null,
                tokenResetarSenhaExpira: null,
            },
        });
        this.logger.log(`✅ Senha resetada com sucesso: ${usuario.nome} (${usuario.email})`);
        return {
            message: 'Senha alterada com sucesso! Você já pode fazer login com sua nova senha.',
        };
    }
};
exports.AutenticacaoService = AutenticacaoService;
exports.AutenticacaoService = AutenticacaoService = AutenticacaoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AutenticacaoService);
//# sourceMappingURL=autenticacao.service.js.map