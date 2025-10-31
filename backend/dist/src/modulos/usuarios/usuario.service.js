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
var UsuarioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const autenticacao_service_1 = require("../autenticacao/autenticacao.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let UsuarioService = UsuarioService_1 = class UsuarioService {
    constructor(prisma, autenticacaoService) {
        this.prisma = prisma;
        this.autenticacaoService = autenticacaoService;
        this.logger = new common_1.Logger(UsuarioService_1.name);
        this.BCRYPT_SALT_ROUNDS = 10;
        this.TOKEN_EXPIRACAO_MS = 7 * 24 * 3600 * 1000;
    }
    _limparCpf(cpf) {
        const cpfLimpo = cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            throw new common_1.BadRequestException(`CPF inválido. Deve conter exatamente 11 dígitos. Recebido: ${cpfLimpo.length} dígitos.`);
        }
        return cpfLimpo;
    }
    _limparWhatsApp(whatsapp) {
        const whatsappLimpo = whatsapp.replace(/\D/g, '');
        if (whatsappLimpo.length < 10 || whatsappLimpo.length > 13) {
            throw new common_1.BadRequestException(`WhatsApp inválido. Deve conter entre 10 e 13 dígitos (com DDD e código do país). Recebido: ${whatsappLimpo.length} dígitos.`);
        }
        return whatsappLimpo;
    }
    async listar(filtros = {}) {
        this.logger.log('Admin: Listando usuários com filtros avançados');
        const where = {};
        if (filtros.nomeOuEmail) {
            where.OR = [
                { nome: { contains: filtros.nomeOuEmail, mode: 'insensitive' } },
                { email: { contains: filtros.nomeOuEmail, mode: 'insensitive' } },
            ];
        }
        if (filtros.papel) {
            where.papel = filtros.papel;
        }
        if (filtros.status) {
            where.status = filtros.status;
        }
        if (filtros.opticaId) {
            where.opticaId = filtros.opticaId;
        }
        return this.prisma.usuario.findMany({
            where,
            include: {
                optica: true,
                gerente: { select: { id: true, nome: true, email: true } },
                vendedores: { select: { id: true, nome: true, email: true } },
            },
            orderBy: { nome: 'asc' },
        });
    }
    async buscarPorId(id) {
        this.logger.log(`Buscando usuário por ID: ${id}`);
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
            include: {
                optica: true,
                gerente: { select: { id: true, nome: true, email: true } },
                vendedores: { select: { id: true, nome: true, email: true } },
            },
        });
        if (!usuario) {
            this.logger.warn(`Usuário não encontrado: ${id}`);
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
        return usuario;
    }
    async criarAdmin(dados) {
        this.logger.log(`[ADMIN] Criando usuário: ${dados.email} (Papel: ${dados.papel})`);
        if (dados.opticaId) {
            const optica = await this.prisma.optica.findUnique({
                where: { id: dados.opticaId },
            });
            if (!optica) {
                throw new common_1.BadRequestException('Ótica não encontrada. Verifique o ID informado.');
            }
            if (!optica.ativa) {
                throw new common_1.BadRequestException(`A ótica "${optica.nome}" está inativa e não pode ter usuários vinculados.`);
            }
        }
        if (dados.gerenteId) {
            const gerente = await this.prisma.usuario.findUnique({
                where: { id: dados.gerenteId },
            });
            if (!gerente) {
                throw new common_1.BadRequestException('Gerente não encontrado. Verifique o ID informado.');
            }
            if (gerente.papel !== 'GERENTE') {
                throw new common_1.BadRequestException(`O usuário "${gerente.nome}" não é um gerente. Apenas usuários com papel GERENTE podem ser vinculados.`);
            }
        }
        let cpfLimpo;
        if (dados.cpf) {
            cpfLimpo = this._limparCpf(dados.cpf);
        }
        let whatsappLimpo;
        if (dados.whatsapp) {
            whatsappLimpo = this._limparWhatsApp(dados.whatsapp);
        }
        const usuarioExistente = await this.prisma.usuario.findFirst({
            where: {
                OR: [
                    { email: dados.email },
                    ...(cpfLimpo ? [{ cpf: cpfLimpo }] : []),
                ],
            },
        });
        if (usuarioExistente) {
            if (usuarioExistente.email === dados.email) {
                throw new common_1.ConflictException(`O email "${dados.email}" já está cadastrado no sistema.`);
            }
            else {
                throw new common_1.ConflictException(`O CPF "${dados.cpf}" já está cadastrado para o usuário "${usuarioExistente.nome}".`);
            }
        }
        let senhaHash;
        let tokenOriginal = null;
        let tokenHash = null;
        let tokenResetarSenhaExpira = null;
        if (dados.senha) {
            this.logger.log(`  → Senha fornecida. Usuário poderá logar imediatamente.`);
            senhaHash = await bcrypt.hash(dados.senha, this.BCRYPT_SALT_ROUNDS);
        }
        else {
            this.logger.log(`  → Senha NÃO fornecida. Gerando token de primeiro acesso (validade: 7 dias)`);
            tokenOriginal = crypto.randomBytes(32).toString('hex');
            tokenHash = crypto
                .createHash('sha256')
                .update(tokenOriginal)
                .digest('hex');
            tokenResetarSenhaExpira = new Date(Date.now() + this.TOKEN_EXPIRACAO_MS);
            const senhaTemporariaImpossivel = crypto.randomBytes(64).toString('hex');
            senhaHash = await bcrypt.hash(senhaTemporariaImpossivel, this.BCRYPT_SALT_ROUNDS);
            this.logger.log(`  → Token gerado. Expira em: ${tokenResetarSenhaExpira.toLocaleString('pt-BR')}`);
        }
        const usuario = await this.prisma.usuario.create({
            data: {
                nome: dados.nome,
                email: dados.email,
                senhaHash,
                papel: dados.papel,
                status: dados.status || 'ATIVO',
                cpf: cpfLimpo,
                whatsapp: whatsappLimpo,
                opticaId: dados.opticaId,
                gerenteId: dados.gerenteId,
                tokenResetarSenha: tokenHash,
                tokenResetarSenhaExpira: tokenResetarSenhaExpira,
            },
            include: {
                optica: true,
                gerente: { select: { id: true, nome: true, email: true } },
            },
        });
        this.logger.log(`✅ Usuário criado com sucesso: ${usuario.nome} (${usuario.email})`);
        this.logger.log(`  → ID: ${usuario.id}`);
        this.logger.log(`  → Papel: ${usuario.papel}`);
        this.logger.log(`  → Status: ${usuario.status}`);
        if (usuario.optica) {
            this.logger.log(`  → Ótica: ${usuario.optica.nome}`);
        }
        if (usuario.gerente) {
            this.logger.log(`  → Gerente: ${usuario.gerente.nome}`);
        }
        if (tokenOriginal) {
            this.logger.log(`  → ⚠️  Token de primeiro acesso gerado. Admin deve copiar e enviar ao usuário.`);
        }
        return {
            usuario,
            tokenOriginal,
        };
    }
    async atualizar(id, dados) {
        this.logger.log(`Atualizando usuário: ${id}`);
        await this.buscarPorId(id);
        if (dados.opticaId) {
            const optica = await this.prisma.optica.findUnique({
                where: { id: dados.opticaId },
            });
            if (!optica || !optica.ativa) {
                throw new common_1.BadRequestException('Ótica inválida ou inativa.');
            }
        }
        if (dados.gerenteId) {
            const gerente = await this.prisma.usuario.findUnique({
                where: { id: dados.gerenteId },
            });
            if (!gerente || gerente.papel !== 'GERENTE') {
                throw new common_1.BadRequestException('Gerente inválido.');
            }
        }
        let cpfLimpo;
        if (dados.cpf) {
            cpfLimpo = this._limparCpf(dados.cpf);
        }
        let whatsappLimpo;
        if (dados.whatsapp) {
            whatsappLimpo = this._limparWhatsApp(dados.whatsapp);
        }
        if (dados.email || cpfLimpo) {
            const usuarioComMesmoDado = await this.prisma.usuario.findFirst({
                where: {
                    OR: [
                        ...(dados.email ? [{ email: dados.email }] : []),
                        ...(cpfLimpo ? [{ cpf: cpfLimpo }] : []),
                    ],
                    NOT: { id },
                },
            });
            if (usuarioComMesmoDado) {
                if (usuarioComMesmoDado.email === dados.email) {
                    throw new common_1.ConflictException('Este email já está em uso por outro usuário');
                }
                else {
                    throw new common_1.ConflictException('Este CPF já está em uso por outro usuário');
                }
            }
        }
        const dadosAtualizacao = { ...dados };
        delete dadosAtualizacao.senha;
        if (cpfLimpo) {
            dadosAtualizacao.cpf = cpfLimpo;
        }
        if (whatsappLimpo) {
            dadosAtualizacao.whatsapp = whatsappLimpo;
        }
        return this.prisma.usuario.update({
            where: { id },
            data: dadosAtualizacao,
        });
    }
    async remover(id) {
        this.logger.log(`Removendo usuário: ${id}`);
        await this.buscarPorId(id);
        const usuario = await this.prisma.usuario.update({
            where: { id },
            data: { status: 'BLOQUEADO' },
        });
        this.logger.log(`✅ Usuário bloqueado (soft delete): ${usuario.nome}`);
        return usuario;
    }
    async aprovar(id) {
        this.logger.log(`Aprovando usuário: ${id}`);
        const usuario = await this.buscarPorId(id);
        if (usuario.status === 'ATIVO') {
            this.logger.warn(`Tentativa de aprovar usuário já ativo: ${id}`);
            throw new common_1.BadRequestException('Este usuário já está ativo');
        }
        if (usuario.status === 'BLOQUEADO') {
            this.logger.warn(`Tentativa de aprovar usuário bloqueado: ${id}`);
            throw new common_1.BadRequestException('Este usuário está bloqueado. Desbloqueie antes de aprovar.');
        }
        const usuarioAprovado = await this.prisma.usuario.update({
            where: { id },
            data: { status: 'ATIVO' },
        });
        this.logger.log(`✅ Usuário aprovado: ${usuarioAprovado.nome} (${usuarioAprovado.email})`);
        return usuarioAprovado;
    }
    async bloquear(id) {
        this.logger.log(`Bloqueando usuário: ${id}`);
        const usuario = await this.buscarPorId(id);
        if (usuario.status === 'BLOQUEADO') {
            this.logger.warn(`Tentativa de bloquear usuário já bloqueado: ${id}`);
            throw new common_1.BadRequestException('Este usuário já está bloqueado');
        }
        const usuarioBloqueado = await this.prisma.usuario.update({
            where: { id },
            data: { status: 'BLOQUEADO' },
        });
        this.logger.log(`✅ Usuário bloqueado: ${usuarioBloqueado.nome} (${usuarioBloqueado.email})`);
        return usuarioBloqueado;
    }
    async desbloquear(id) {
        const usuario = await this.buscarPorId(id);
        if (usuario.status !== 'BLOQUEADO') {
            throw new common_1.BadRequestException('Usuário não está bloqueado.');
        }
        return this.prisma.usuario.update({
            where: { id },
            data: { status: 'ATIVO' },
        });
    }
    async personificar(idUsuarioAdmin, idUsuarioAlvo) {
        this.logger.log(`Impersonação solicitada: Admin ${idUsuarioAdmin} → Usuário ${idUsuarioAlvo}`);
        if (idUsuarioAdmin === idUsuarioAlvo) {
            this.logger.warn(`Tentativa de auto-impersonação bloqueada: ${idUsuarioAdmin}`);
            throw new common_1.BadRequestException('Você não pode personificar a si mesmo');
        }
        const usuarioAlvo = await this.buscarPorId(idUsuarioAlvo);
        const token = this.autenticacaoService.gerarToken({
            id: usuarioAlvo.id,
            email: usuarioAlvo.email,
            papel: usuarioAlvo.papel,
            nome: usuarioAlvo.nome,
        });
        this.logger.log(`✅ Token de impersonação gerado: Admin personificando ${usuarioAlvo.nome} (${usuarioAlvo.email})`);
        return token;
    }
    async iniciarResetSenhaAdmin(idUsuario) {
        this.logger.log(`Iniciando reset de senha para usuário: ${idUsuario}`);
        const usuario = await this.buscarPorId(idUsuario);
        const tokenOriginal = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto
            .createHash('sha256')
            .update(tokenOriginal)
            .digest('hex');
        const expiraEm = new Date(Date.now() + 3600000);
        await this.prisma.usuario.update({
            where: { id: idUsuario },
            data: {
                tokenResetarSenha: tokenHash,
                tokenResetarSenhaExpira: expiraEm,
            },
        });
        this.logger.log(`✅ Token de reset gerado para: ${usuario.nome} (${usuario.email}) - Expira em: ${expiraEm.toLocaleString('pt-BR')}`);
        return { tokenOriginal };
    }
};
exports.UsuarioService = UsuarioService;
exports.UsuarioService = UsuarioService = UsuarioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        autenticacao_service_1.AutenticacaoService])
], UsuarioService);
//# sourceMappingURL=usuario.service.js.map