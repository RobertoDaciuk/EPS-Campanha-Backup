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
var CampanhaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampanhaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CampanhaService = CampanhaService_1 = class CampanhaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CampanhaService_1.name);
    }
    async criar(dto) {
        this.logger.log(`Criando campanha: ${dto.titulo}`);
        const dataInicio = new Date(dto.dataInicio);
        const dataFim = new Date(dto.dataFim);
        if (dataFim <= dataInicio) {
            throw new common_1.BadRequestException('A data de término deve ser posterior à data de início');
        }
        for (const cartelaDto of dto.cartelas) {
            const ordensEncontradas = new Set();
            for (const requisitoDto of cartelaDto.requisitos) {
                if (ordensEncontradas.has(requisitoDto.ordem)) {
                    throw new common_1.BadRequestException(`A Cartela ${cartelaDto.numeroCartela} possui requisitos com a Ordem (${requisitoDto.ordem}) duplicada. A Ordem deve ser única dentro da mesma cartela.`);
                }
                ordensEncontradas.add(requisitoDto.ordem);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const dadosCampanha = {
                titulo: dto.titulo,
                descricao: dto.descricao,
                dataInicio,
                dataFim,
                moedinhasPorCartela: dto.moedinhasPorCartela,
                pontosReaisPorCartela: dto.pontosReaisPorCartela,
                percentualGerente: dto.percentualGerente,
                status: 'ATIVA',
                paraTodasOticas: dto.paraTodasOticas ?? false,
            };
            if (!dadosCampanha.paraTodasOticas && dto.oticasAlvoIds && dto.oticasAlvoIds.length > 0) {
                const countOticas = await tx.optica.count({
                    where: { id: { in: dto.oticasAlvoIds }, ativa: true },
                });
                if (countOticas !== dto.oticasAlvoIds.length) {
                    throw new common_1.BadRequestException('Um ou mais IDs de Óticas Alvo são inválidos ou inativos.');
                }
                dadosCampanha.oticasAlvo = {
                    connect: dto.oticasAlvoIds.map(id => ({ id })),
                };
                this.logger.log(`Campanha direcionada para ${dto.oticasAlvoIds.length} ótica(s) específica(s).`);
            }
            else if (dadosCampanha.paraTodasOticas) {
                this.logger.log(`Campanha criada para TODAS as óticas (paraTodasOticas=true).`);
            }
            const campanha = await tx.campanha.create({ data: dadosCampanha });
            this.logger.log(`Campanha base criada: ${campanha.id}`);
            for (const cartelaDto of dto.cartelas) {
                this.logger.log(`Criando cartela ${cartelaDto.numeroCartela} para campanha ${campanha.id}`);
                const regraCartela = await tx.regraCartela.create({
                    data: {
                        numeroCartela: cartelaDto.numeroCartela,
                        descricao: cartelaDto.descricao,
                        campanhaId: campanha.id,
                    },
                });
                for (const requisitoDto of cartelaDto.requisitos) {
                    this.logger.log(`Criando requisito "${requisitoDto.descricao}" (ordem ${requisitoDto.ordem}) para cartela ${regraCartela.numeroCartela}`);
                    const requisito = await tx.requisitoCartela.create({
                        data: {
                            descricao: requisitoDto.descricao,
                            quantidade: requisitoDto.quantidade,
                            tipoUnidade: requisitoDto.tipoUnidade,
                            ordem: requisitoDto.ordem,
                            regraCartelaId: regraCartela.id,
                        },
                    });
                    for (const condicaoDto of requisitoDto.condicoes) {
                        this.logger.log(`Criando condição ${condicaoDto.campo} ${condicaoDto.operador} "${condicaoDto.valor}" para requisito ${requisito.id}`);
                        await tx.condicaoRequisito.create({
                            data: {
                                campo: condicaoDto.campo,
                                operador: condicaoDto.operador,
                                valor: condicaoDto.valor,
                                requisitoId: requisito.id,
                            },
                        });
                    }
                }
            }
            this.logger.log(`✅ Campanha "${campanha.titulo}" criada com sucesso (ID: ${campanha.id})`);
            return campanha;
        });
    }
    async listar(usuario) {
        this.logger.log(`Listando campanhas para usuário: ${usuario.id} (${usuario.papel})`);
        const where = {
            status: 'ATIVA',
        };
        if (usuario.papel !== client_1.PapelUsuario.ADMIN) {
            const condicoesVisibilidade = [
                { paraTodasOticas: true },
            ];
            if (usuario.opticaId) {
                const opticaUsuario = await this.prisma.optica.findUnique({
                    where: { id: usuario.opticaId },
                    select: { id: true, matrizId: true },
                });
                if (opticaUsuario) {
                    condicoesVisibilidade.push({
                        oticasAlvo: { some: { id: opticaUsuario.id } },
                    });
                    if (opticaUsuario.matrizId) {
                        condicoesVisibilidade.push({
                            oticasAlvo: { some: { id: opticaUsuario.matrizId } },
                        });
                    }
                }
            }
            where.OR = condicoesVisibilidade;
        }
        const campanhas = await this.prisma.campanha.findMany({
            where,
            orderBy: { dataInicio: 'desc' },
        });
        this.logger.log(`📋 ${campanhas.length} campanha(s) encontrada(s) para usuário ${usuario.id}`);
        return campanhas;
    }
    async buscarPorId(id, usuario) {
        this.logger.log(`Buscando campanha por ID: ${id}${usuario ? ` (usuário: ${usuario.id})` : ' (chamada interna)'}`);
        const campanha = await this.prisma.campanha.findUnique({
            where: { id },
            include: {
                cartelas: {
                    orderBy: { numeroCartela: 'asc' },
                    include: {
                        requisitos: {
                            include: {
                                condicoes: true,
                            },
                        },
                    },
                },
                oticasAlvo: {
                    select: { id: true, nome: true },
                },
            },
        });
        if (!campanha) {
            this.logger.warn(`Campanha não encontrada: ${id}`);
            throw new common_1.NotFoundException(`Campanha com ID ${id} não encontrada`);
        }
        if (usuario && usuario.papel !== client_1.PapelUsuario.ADMIN) {
            let podeVer = campanha.paraTodasOticas;
            if (!podeVer && usuario.opticaId) {
                if (campanha.oticasAlvo.some(otica => otica.id === usuario.opticaId)) {
                    podeVer = true;
                }
                else {
                    const opticaUsuario = await this.prisma.optica.findUnique({
                        where: { id: usuario.opticaId },
                        select: { matrizId: true },
                    });
                    if (opticaUsuario?.matrizId &&
                        campanha.oticasAlvo.some(otica => otica.id === opticaUsuario.matrizId)) {
                        podeVer = true;
                    }
                }
            }
            if (!podeVer) {
                this.logger.warn(`Usuário ${usuario.id} tentou acessar campanha restrita ${id}.`);
                throw new common_1.NotFoundException(`Campanha com ID ${id} não encontrada ou não acessível.`);
            }
        }
        return campanha;
    }
    async atualizar(id, dto) {
        this.logger.log(`Atualizando campanha: ${id}`);
        await this.buscarPorId(id);
        if (dto.dataInicio && dto.dataFim) {
            const dataInicio = new Date(dto.dataInicio);
            const dataFim = new Date(dto.dataFim);
            if (dataFim <= dataInicio) {
                throw new common_1.BadRequestException('A data de término deve ser posterior à data de início');
            }
        }
        const dados = { ...dto };
        if (dto.dataInicio) {
            dados.dataInicio = new Date(dto.dataInicio);
        }
        if (dto.dataFim) {
            dados.dataFim = new Date(dto.dataFim);
        }
        if (dto.paraTodasOticas !== undefined) {
            dados.paraTodasOticas = dto.paraTodasOticas;
        }
        delete dados['cartelas'];
        delete dados['oticasAlvoIds'];
        const campanha = await this.prisma.campanha.update({
            where: { id },
            data: dados,
        });
        this.logger.log(`✅ Campanha atualizada: ${campanha.titulo}`);
        return campanha;
    }
    async remover(id, usuario) {
        this.logger.log(`Removendo campanha: ${id}`);
        await this.buscarPorId(id, usuario);
        const campanha = await this.prisma.campanha.delete({
            where: { id },
        });
        this.logger.log(`✅ Campanha deletada permanentemente: ${campanha.titulo}`);
        return campanha;
    }
};
exports.CampanhaService = CampanhaService;
exports.CampanhaService = CampanhaService = CampanhaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampanhaService);
//# sourceMappingURL=campanha.service.js.map