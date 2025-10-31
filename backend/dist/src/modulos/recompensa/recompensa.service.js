"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RecompensaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecompensaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let RecompensaService = RecompensaService_1 = class RecompensaService {
    constructor() {
        this.logger = new common_1.Logger(RecompensaService_1.name);
    }
    async processarGatilhos(tx, envioValidado, campanha, vendedor) {
        await tx.notificacao.create({
            data: {
                mensagem: `Sua venda '${envioValidado.numeroPedido}' foi APROVADA.`,
                usuarioId: vendedor.id,
            },
        });
        const estaCompleta = await this._verificarCartelaCompleta(tx, envioValidado.numeroCartelaAtendida, envioValidado.vendedorId, campanha.id);
        if (estaCompleta) {
            try {
                await tx.cartelaConcluida.create({
                    data: {
                        vendedorId: vendedor.id,
                        campanhaId: campanha.id,
                        numeroCartela: envioValidado.numeroCartelaAtendida,
                    },
                });
                this.logger.log(`Cartela ${envioValidado.numeroCartelaAtendida} do vendedor ${vendedor.nome} COMPLETA. Prêmio financeiro e pontos aplicados.`);
                await this._aplicarRecompensas(tx, campanha, vendedor, envioValidado.numeroCartelaAtendida);
            }
            catch (e) {
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    this.logger.warn(`Cartela ${envioValidado.numeroCartelaAtendida} do vendedor ${vendedor.nome} já paga (ledger pré-existente). Pulando recompensa.`);
                    return;
                }
                throw e;
            }
        }
    }
    async _verificarCartelaCompleta(tx, numeroCartela, vendedorId, campanhaId) {
        const regraCartela = await tx.regraCartela.findFirst({
            where: { campanhaId, numeroCartela },
            include: { requisitos: true },
        });
        if (!regraCartela)
            return false;
        const resultados = await Promise.all(regraCartela.requisitos.map(async (req) => {
            const count = await tx.envioVenda.count({
                where: {
                    vendedorId,
                    requisitoId: req.id,
                    status: 'VALIDADO',
                },
            });
            return count >= req.quantidade;
        }));
        return resultados.every((ok) => ok);
    }
    async _aplicarRecompensas(tx, campanha, vendedor, numeroCartela) {
        await tx.relatorioFinanceiro.create({
            data: {
                valor: campanha.pontosReaisPorCartela,
                tipo: 'VENDEDOR',
                usuarioId: vendedor.id,
                campanhaId: campanha.id,
                observacoes: `Pagamento automático por conclusão da Cartela ${numeroCartela}.`,
            },
        });
        const percentual = campanha.percentualGerente?.toNumber ? campanha.percentualGerente.toNumber() : Number(campanha.percentualGerente);
        if (percentual > 0 && vendedor.gerente) {
            const valorCartela = campanha.pontosReaisPorCartela?.toNumber ? campanha.pontosReaisPorCartela.toNumber() : Number(campanha.pontosReaisPorCartela);
            const valorGerente = valorCartela * (percentual / 100);
            await tx.relatorioFinanceiro.create({
                data: {
                    valor: valorGerente,
                    tipo: 'GERENTE',
                    usuarioId: vendedor.gerente.id,
                    campanhaId: campanha.id,
                    observacoes: `Comissão automática pela Cartela ${numeroCartela} do vendedor ${vendedor.nome}.`,
                },
            });
        }
        await tx.usuario.update({
            where: { id: vendedor.id },
            data: {
                saldoMoedinhas: { increment: campanha.moedinhasPorCartela },
                rankingMoedinhas: { increment: campanha.moedinhasPorCartela },
            },
        });
        await tx.notificacao.create({
            data: {
                mensagem: `Parabéns! Você completou a Cartela ${numeroCartela} da campanha '${campanha.titulo}'. Pontos e recompensas já lançados!`,
                usuarioId: vendedor.id,
            },
        });
    }
};
exports.RecompensaService = RecompensaService;
exports.RecompensaService = RecompensaService = RecompensaService_1 = __decorate([
    (0, common_1.Injectable)()
], RecompensaService);
//# sourceMappingURL=recompensa.service.js.map