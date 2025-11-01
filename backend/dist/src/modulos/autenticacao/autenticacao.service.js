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
exports.AutenticacaoService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
const usuario_service_1 = require("../usuarios/usuario.service");
let AutenticacaoService = class AutenticacaoService {
    constructor(prisma, jwtService, usuarioService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
    }
    async registrar(dados, req) {
        const cpfLimpo = this._limparCpf(dados.cpf);
        if (!this._validarCpf(cpfLimpo)) {
            await this._registrarlogAutenticacao({
                tipo: 'REGISTRO_FALHA_CPF_INVALIDO',
                email: dados.email,
                cpf: dados.cpf,
                usuarioId: null,
                req,
                detalhes: { motivo: 'cpf_nao_passou_na_validacao_de_digitos' },
            });
            throw new common_1.BadRequestException('O CPF fornecido é inválido.');
        }
        const usuarioExistente = await this.prisma.usuario.findFirst({
            where: {
                OR: [{ email: dados.email }, { cpf: cpfLimpo }],
            },
            select: {
                id: true,
                email: true,
                cpf: true,
            },
        });
        if (usuarioExistente) {
            const tipoDuplicacao = usuarioExistente.email === dados.email
                ? 'REGISTRO_DUPLICADO_EMAIL'
                : 'REGISTRO_DUPLICADO_CPF';
            await this._registrarlogAutenticacao({
                tipo: tipoDuplicacao,
                email: dados.email,
                cpf: cpfLimpo,
                usuarioId: usuarioExistente.id,
                req,
                detalhes: {
                    motivo: tipoDuplicacao === 'REGISTRO_DUPLICADO_EMAIL'
                        ? 'email_ja_cadastrado'
                        : 'cpf_ja_cadastrado',
                },
            });
            throw new common_1.ConflictException('Dados já cadastrados no sistema. Verifique as informações fornecidas.');
        }
        const senhaHash = await bcrypt.hash(dados.senha, 10);
        const novoUsuario = await this.prisma.$transaction(async (tx) => {
            const usuario = await tx.usuario.create({
                data: {
                    nome: dados.nome,
                    email: dados.email,
                    senhaHash,
                    cpf: cpfLimpo,
                    papel: 'VENDEDOR',
                    status: 'PENDENTE',
                    opticaId: dados.opticaId,
                },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    papel: true,
                    status: true,
                },
            });
            await tx.logAutenticacao.create({
                data: {
                    tipo: 'REGISTRO_SUCESSO',
                    email: usuario.email,
                    cpf: cpfLimpo,
                    usuarioId: usuario.id,
                    ipAddress: this._extrairIp(req),
                    userAgent: this._extrairUserAgent(req),
                    detalhes: {
                        papel: usuario.papel,
                        status: usuario.status,
                    },
                },
            });
            return usuario;
        });
        if (process.env.NODE_ENV !== 'production') {
            console.log('[AUTENTICACAO] Novo vendedor registrado:', {
                id: novoUsuario.id,
                email: novoUsuario.email,
                status: novoUsuario.status,
            });
        }
        return {
            mensagem: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador para fazer login.',
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
            },
        };
    }
    async login(dados, req) {
        const { email, senha } = dados;
        const usuario = await this.prisma.usuario.findUnique({
            where: { email },
            include: {
                optica: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
            },
        });
        const senhaHash = usuario?.senhaHash || (await bcrypt.hash('senha-fake-para-timing', 10));
        const senhaValida = await bcrypt.compare(senha, senhaHash);
        if (!usuario || !senhaValida) {
            await this._registrarlogAutenticacao({
                tipo: 'LOGIN_FALHA_CREDENCIAIS',
                email,
                cpf: null,
                usuarioId: usuario?.id || null,
                req,
                detalhes: {
                    motivo: !usuario ? 'email_nao_encontrado' : 'senha_incorreta',
                },
            });
            throw new common_1.UnauthorizedException('Credenciais inválidas.');
        }
        if (usuario.status !== 'ATIVO') {
            await this._registrarlogAutenticacao({
                tipo: 'LOGIN_FALHA_STATUS',
                email,
                cpf: usuario.cpf,
                usuarioId: usuario.id,
                req,
                detalhes: {
                    motivo: 'status_nao_ativo',
                    statusAtual: usuario.status,
                },
            });
            const mensagemStatus = usuario.status === 'PENDENTE'
                ? 'Sua conta ainda não foi aprovada pelo administrador.'
                : 'Sua conta foi bloqueada. Entre em contato com o administrador.';
            throw new common_1.UnauthorizedException(mensagemStatus);
        }
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            papel: usuario.papel,
        };
        const token = this.jwtService.sign(payload);
        await this._registrarlogAutenticacao({
            tipo: 'LOGIN_SUCESSO',
            email,
            cpf: usuario.cpf,
            usuarioId: usuario.id,
            req,
            detalhes: {
                papel: usuario.papel,
            },
        });
        if (process.env.NODE_ENV !== 'production') {
            console.log('[AUTENTICACAO] Login bem-sucedido:', {
                id: usuario.id,
                email: usuario.email,
                papel: usuario.papel,
            });
        }
        return {
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel,
                optica: usuario.optica,
            },
        };
    }
    async resetarSenha(dados, req) {
        const { token, novaSenha } = dados;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const usuario = await this.prisma.usuario.findFirst({
            where: {
                tokenResetarSenha: tokenHash,
                tokenResetarSenhaExpira: {
                    gt: new Date(),
                },
            },
            select: {
                id: true,
                email: true,
                cpf: true,
            },
        });
        if (!usuario) {
            await this._registrarlogAutenticacao({
                tipo: 'RESET_TOKEN_INVALIDO',
                email: null,
                cpf: null,
                usuarioId: null,
                req,
                detalhes: {
                    motivo: 'token_invalido_ou_expirado',
                    tokenHash: tokenHash.substring(0, 10) + '...',
                },
            });
            throw new common_1.NotFoundException('Token de reset inválido ou expirado. Solicite um novo token.');
        }
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        await this.prisma.$transaction(async (tx) => {
            await tx.usuario.update({
                where: { id: usuario.id },
                data: {
                    senhaHash: novaSenhaHash,
                    tokenResetarSenha: null,
                    tokenResetarSenhaExpira: null,
                },
            });
            await tx.logAutenticacao.create({
                data: {
                    tipo: 'RESET_TOKEN_SUCESSO',
                    email: usuario.email,
                    cpf: usuario.cpf,
                    usuarioId: usuario.id,
                    ipAddress: this._extrairIp(req),
                    userAgent: this._extrairUserAgent(req),
                    detalhes: {
                        motivo: 'senha_resetada_com_sucesso',
                    },
                },
            });
        });
        if (process.env.NODE_ENV !== 'production') {
            console.log('[AUTENTICACAO] Senha resetada com sucesso:', {
                id: usuario.id,
                email: usuario.email,
            });
        }
        return {
            mensagem: 'Senha resetada com sucesso! Você já pode fazer login com a nova senha.',
        };
    }
    gerarToken(payload) {
        return this.jwtService.sign({
            sub: payload.id,
            email: payload.email,
            papel: payload.papel,
        });
    }
    _limparCpf(cpf) {
        const cpfLimpo = cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            throw new common_1.BadRequestException('CPF inválido. Deve conter exatamente 11 dígitos.');
        }
        return cpfLimpo;
    }
    _validarCpf(cpfLimpo) {
        if (/^(\d)\1{10}$/.test(cpfLimpo)) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`[VALIDACAO] CPF inválido detectado (dígitos repetidos): ${cpfLimpo}`);
            }
            return false;
        }
        return true;
    }
    _extrairIp(req) {
        return (req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
            req?.headers?.['x-real-ip'] ||
            req?.ip ||
            req?.connection?.remoteAddress ||
            'unknown');
    }
    _extrairUserAgent(req) {
        return req?.headers?.['user-agent'] || null;
    }
    async _registrarlogAutenticacao(dados) {
        try {
            const ipAddress = this._extrairIp(dados.req);
            const userAgent = this._extrairUserAgent(dados.req);
            await this.prisma.logAutenticacao.create({
                data: {
                    tipo: dados.tipo,
                    email: dados.email,
                    cpf: dados.cpf || null,
                    usuarioId: dados.usuarioId,
                    ipAddress,
                    userAgent,
                    detalhes: dados.detalhes || null,
                },
            });
            if (process.env.NODE_ENV !== 'production' &&
                dados.tipo.includes('FALHA')) {
                console.log('[AUTENTICACAO] Log de auditoria registrado:', {
                    tipo: dados.tipo,
                    email: dados.email,
                    ipAddress,
                });
            }
        }
        catch (erro) {
            console.error('[AUTENTICACAO] Erro ao registrar log de auditoria:', erro);
        }
    }
};
exports.AutenticacaoService = AutenticacaoService;
exports.AutenticacaoService = AutenticacaoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        usuario_service_1.UsuarioService])
], AutenticacaoService);
//# sourceMappingURL=autenticacao.service.js.map