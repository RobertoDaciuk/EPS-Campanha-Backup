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
var OticaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OticaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let OticaService = OticaService_1 = class OticaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OticaService_1.name);
    }
    _limparCnpj(cnpj) {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
            throw new common_1.BadRequestException(`CNPJ inválido. Deve conter exatamente 14 dígitos. Recebido: ${cnpjLimpo.length} dígitos.`);
        }
        return cnpjLimpo;
    }
    async _validarHierarquia(ehMatriz, matrizId, oticaAtualId = null) {
        if (ehMatriz && matrizId) {
            throw new common_1.BadRequestException('Uma ótica marcada como MATRIZ não pode ter uma matriz pai. Remova o vínculo com a matriz ou desmarque "É Matriz".');
        }
        if (matrizId) {
            const matriz = await this.prisma.optica.findUnique({
                where: { id: matrizId },
            });
            if (!matriz) {
                throw new common_1.BadRequestException(`A ótica matriz informada (ID: ${matrizId}) não foi encontrada no sistema.`);
            }
            if (!matriz.ehMatriz) {
                throw new common_1.BadRequestException(`A ótica "${matriz.nome}" não está marcada como MATRIZ. Uma filial só pode ser vinculada a uma ótica que seja Matriz.`);
            }
            if (oticaAtualId && matriz.matrizId === oticaAtualId) {
                throw new common_1.BadRequestException(`Hierarquia circular detectada! A ótica "${matriz.nome}" já é filial da ótica atual. Não é possível criar uma relação circular (A→B→A).`);
            }
        }
    }
    async listarTudo() {
        this.logger.log('Listando todas as óticas');
        const oticas = await this.prisma.optica.findMany({
            orderBy: { nome: 'asc' },
            include: {
                matriz: { select: { id: true, nome: true, cnpj: true } },
            },
        });
        this.logger.log(`📋 ${oticas.length} ótica(s) encontrada(s)`);
        return oticas;
    }
    async buscarPorId(id) {
        this.logger.log(`Buscando ótica por ID: ${id}`);
        const optica = await this.prisma.optica.findUnique({
            where: { id },
            include: {
                matriz: { select: { id: true, nome: true, cnpj: true } },
                filiais: { select: { id: true, nome: true, cnpj: true } },
            },
        });
        if (!optica) {
            this.logger.warn(`Ótica não encontrada: ${id}`);
            throw new common_1.NotFoundException(`Ótica com ID ${id} não encontrada`);
        }
        return optica;
    }
    async buscarPorCnpjPublico(cnpj) {
        this.logger.log(`Verificando CNPJ público: ${cnpj}`);
        const cnpjLimpo = this._limparCnpj(cnpj);
        const optica = await this.prisma.optica.findUnique({
            where: { cnpj: cnpjLimpo, ativa: true },
        });
        if (!optica) {
            this.logger.warn(`CNPJ não encontrado ou ótica inativa: ${cnpjLimpo}`);
            throw new common_1.NotFoundException('Este CNPJ não pertence a uma ótica ativa parceira.');
        }
        return optica;
    }
    async remover(id) {
        this.logger.log(`Removendo ótica: ${id}`);
        await this.buscarPorId(id);
        const optica = await this.prisma.optica.update({
            where: { id },
            data: { ativa: false },
        });
        this.logger.log(`✅ Ótica desativada com sucesso: ${optica.nome}`);
        return optica;
    }
    async listarAdmin(filtros) {
        this.logger.log(`[ADMIN] Listando óticas com filtros: ${JSON.stringify(filtros)}`);
        const where = {};
        if (filtros.nome) {
            where.nome = { contains: filtros.nome, mode: 'insensitive' };
        }
        if (filtros.cnpj) {
            where.cnpj = { contains: this._limparCnpj(filtros.cnpj) };
        }
        if (filtros.ativa !== undefined) {
            where.ativa = filtros.ativa === 'true';
        }
        if (filtros.ehMatriz !== undefined) {
            where.ehMatriz = filtros.ehMatriz;
            this.logger.log(`  → Filtrando por tipo: ${filtros.ehMatriz ? 'MATRIZES' : 'FILIAIS'}`);
        }
        const oticas = await this.prisma.optica.findMany({
            where,
            orderBy: { nome: 'asc' },
            include: {
                matriz: { select: { id: true, nome: true, cnpj: true } },
                filiais: { select: { id: true, nome: true, cnpj: true } },
            },
        });
        this.logger.log(`  → ${oticas.length} ótica(s) encontrada(s)`);
        return oticas;
    }
    async buscarPorIdAdmin(id) {
        this.logger.log(`Buscando ótica por ID (Admin): ${id}`);
        const optica = await this.prisma.optica.findUnique({
            where: { id },
            include: {
                matriz: { select: { id: true, nome: true, cnpj: true } },
                filiais: { select: { id: true, nome: true, cnpj: true } },
            },
        });
        if (!optica) {
            this.logger.warn(`Ótica não encontrada, ID: ${id}`);
            throw new common_1.NotFoundException(`Ótica com ID ${id} não encontrada.`);
        }
        return optica;
    }
    async criar(dto) {
        this.logger.log(`[ADMIN] Criando nova ótica: ${dto.nome}`);
        const cnpjLimpo = this._limparCnpj(dto.cnpj);
        const opticaExistente = await this.prisma.optica.findUnique({
            where: { cnpj: cnpjLimpo },
        });
        if (opticaExistente) {
            this.logger.warn(`Tentativa de cadastro duplicado: CNPJ ${cnpjLimpo} já pertence a "${opticaExistente.nome}"`);
            throw new common_1.ConflictException(`Já existe uma ótica cadastrada com o CNPJ ${dto.cnpj}: "${opticaExistente.nome}".`);
        }
        const ehMatriz = dto.ehMatriz ?? false;
        const matrizId = dto.matrizId ?? null;
        await this._validarHierarquia(ehMatriz, matrizId, null);
        const optica = await this.prisma.optica.create({
            data: {
                cnpj: cnpjLimpo,
                nome: dto.nome,
                endereco: dto.endereco,
                cidade: dto.cidade,
                estado: dto.estado,
                telefone: dto.telefone,
                email: dto.email,
                ativa: true,
                ehMatriz,
                matrizId,
            },
            include: {
                matriz: { select: { id: true, nome: true } },
            },
        });
        this.logger.log(`✅ Ótica criada com sucesso: ${optica.nome}`);
        this.logger.log(`  → ID: ${optica.id}`);
        this.logger.log(`  → CNPJ: ${cnpjLimpo}`);
        this.logger.log(`  → Tipo: ${ehMatriz ? 'MATRIZ' : 'FILIAL'}`);
        if (optica.matriz) {
            this.logger.log(`  → Matriz Pai: ${optica.matriz.nome}`);
        }
        return optica;
    }
    async atualizar(id, dto) {
        this.logger.log(`[ADMIN] Atualizando ótica, ID: ${id}`);
        const oticaAtual = await this.buscarPorIdAdmin(id);
        if (dto.ehMatriz === false &&
            oticaAtual.ehMatriz === true &&
            oticaAtual.filiais &&
            oticaAtual.filiais.length > 0) {
            throw new common_1.BadRequestException(`Não é possível alterar esta ótica para FILIAL pois ela possui ${oticaAtual.filiais.length} filial(is) vinculada(s). Desvincule as filiais primeiro.`);
        }
        if (dto.cnpj) {
            const cnpjLimpo = this._limparCnpj(dto.cnpj);
            const opticaComMesmoCnpj = await this.prisma.optica.findUnique({
                where: { cnpj: cnpjLimpo },
            });
            if (opticaComMesmoCnpj && opticaComMesmoCnpj.id !== id) {
                this.logger.warn(`Tentativa de atualizar para CNPJ duplicado: ${cnpjLimpo}`);
                throw new common_1.ConflictException(`Já existe outra ótica cadastrada com o CNPJ ${dto.cnpj}: "${opticaComMesmoCnpj.nome}".`);
            }
            dto.cnpj = cnpjLimpo;
        }
        if (dto.ehMatriz !== undefined || dto.matrizId !== undefined) {
            const novoEhMatriz = dto.ehMatriz ?? oticaAtual.ehMatriz;
            const novoMatrizId = dto.matrizId !== undefined ? dto.matrizId : oticaAtual.matrizId;
            await this._validarHierarquia(novoEhMatriz, novoMatrizId, id);
        }
        const oticaAtualizada = await this.prisma.optica.update({
            where: { id },
            data: dto,
            include: {
                matriz: { select: { id: true, nome: true } },
                filiais: { select: { id: true, nome: true } },
            },
        });
        this.logger.log(`✅ Ótica atualizada: ${oticaAtualizada.nome}`);
        return oticaAtualizada;
    }
    async desativar(id) {
        this.logger.log(`[ADMIN] Desativando ótica: ${id}`);
        await this.buscarPorIdAdmin(id);
        const optica = await this.prisma.optica.update({
            where: { id },
            data: { ativa: false },
        });
        this.logger.log(`✅ Ótica desativada: ${optica.nome}`);
        return optica;
    }
    async reativar(id) {
        this.logger.log(`[ADMIN] Reativando ótica: ${id}`);
        await this.buscarPorIdAdmin(id);
        const optica = await this.prisma.optica.update({
            where: { id },
            data: { ativa: true },
        });
        this.logger.log(`✅ Ótica reativada: ${optica.nome}`);
        return optica;
    }
};
exports.OticaService = OticaService;
exports.OticaService = OticaService = OticaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OticaService);
//# sourceMappingURL=otica.service.js.map