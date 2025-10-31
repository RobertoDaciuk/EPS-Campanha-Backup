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
var ValidacaoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidacaoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const recompensa_service_1 = require("../recompensa/recompensa.service");
let ValidacaoService = ValidacaoService_1 = class ValidacaoService {
    constructor(prisma, recompensaService) {
        this.prisma = prisma;
        this.recompensaService = recompensaService;
        this.logger = new common_1.Logger(ValidacaoService_1.name);
    }
    async processarPlanilha(dto) {
        const { campanhaId, ehSimulacao, mapaColunas, linhasPlanilha } = dto;
        this.logger.log(`========== INÍCIO DO PROCESSAMENTO ==========`);
        this.logger.log(`Campanha: ${campanhaId}`);
        this.logger.log(`Simulação: ${ehSimulacao}`);
        this.logger.log(`Linhas da planilha: ${linhasPlanilha.length}`);
        this.logger.log(`Buscando envios EM_ANALISE da campanha...`);
        const enviosPendentes = await this.prisma.envioVenda.findMany({
            where: {
                campanhaId: campanhaId,
                status: 'EM_ANALISE',
            },
            include: {
                vendedor: {
                    include: {
                        gerente: true,
                        optica: {
                            include: {
                                matriz: true,
                            },
                        },
                    },
                },
                requisito: {
                    include: {
                        condicoes: true,
                        regraCartela: {
                            include: {
                                campanha: true,
                            },
                        },
                    },
                },
            },
        });
        this.logger.log(`Encontrados ${enviosPendentes.length} envios para processar.`);
        if (enviosPendentes.length === 0) {
            return {
                mensagem: 'Nenhum envio EM_ANALISE encontrado para esta campanha.',
                totalProcessados: 0,
                validado: 0,
                rejeitado: 0,
                conflito_manual: 0,
            };
        }
        const mapaInvertido = {};
        for (const [nomeColunaPlanilha, campoSistema] of Object.entries(mapaColunas)) {
            mapaInvertido[campoSistema] = nomeColunaPlanilha;
        }
        this.logger.log(`Mapa de colunas invertido:`, mapaInvertido);
        const relatorio = {
            validado: 0,
            rejeitado: 0,
            conflito_manual: 0,
        };
        for (const envio of enviosPendentes) {
            this.logger.log(`\n--- Processando Envio ID: ${envio.id} ---`);
            this.logger.log(`Pedido: ${envio.numeroPedido}, Vendedor: ${envio.vendedorId}`);
            let resultadoValidacao;
            this.logger.log(`[1/3] Validando CNPJ para Pedido: ${envio.numeroPedido}...`);
            const colunaCnpjPlanilha = Object.keys(mapaInvertido).find((key) => key === 'CNPJ_OTICA');
            const nomeColunaCnpj = mapaInvertido[colunaCnpjPlanilha];
            if (!nomeColunaCnpj) {
                resultadoValidacao = {
                    status: 'REJEITADO',
                    motivo: 'Mapeamento da coluna CNPJ_OTICA não encontrado no mapaColunas.',
                };
                this.logger.error(`Mapeamento CNPJ_OTICA ausente para Pedido ${envio.numeroPedido}. Pulando envio.`);
                envio['resultado'] = resultadoValidacao;
                relatorio[resultadoValidacao.status.toLowerCase()]++;
                continue;
            }
            const { linhasEncontradas, status, motivo } = this._buscarPedidoPlanilha(envio.numeroPedido, linhasPlanilha, mapaInvertido);
            if (status !== 'OK') {
                resultadoValidacao = {
                    status: status === 'CONFLITO_COLUNA' ? 'CONFLITO_MANUAL' : 'REJEITADO',
                    motivo: motivo,
                };
                this.logger.warn(`Busca do pedido ${envio.numeroPedido} falhou: ${motivo}. Status: ${resultadoValidacao.status}`);
                envio['resultado'] = resultadoValidacao;
                relatorio[resultadoValidacao.status.toLowerCase()]++;
                continue;
            }
            const linhaPlanilha = linhasEncontradas[0];
            const cnpjDaPlanilha = this._limparCnpj(linhaPlanilha[nomeColunaCnpj]);
            const cnpjDoVendedor = this._limparCnpj(envio.vendedor.optica?.cnpj);
            if (!cnpjDoVendedor) {
                resultadoValidacao = {
                    status: 'REJEITADO',
                    motivo: 'Vendedor não está associado a uma ótica com CNPJ cadastrado.',
                };
                this.logger.warn(`Vendedor ${envio.vendedorId} não possui CNPJ associado. Pedido ${envio.numeroPedido} rejeitado.`);
            }
            else if (!cnpjDaPlanilha) {
                resultadoValidacao = {
                    status: 'REJEITADO',
                    motivo: `Coluna '${nomeColunaCnpj}' (CNPJ) não encontrada ou vazia na planilha para este pedido.`,
                };
                this.logger.warn(`CNPJ não encontrado na planilha para Pedido ${envio.numeroPedido}.`);
            }
            else if (cnpjDaPlanilha.length !== 14) {
                resultadoValidacao = {
                    status: 'REJEITADO',
                    motivo: `CNPJ '${cnpjDaPlanilha}' na planilha é inválido (não possui 14 dígitos numéricos).`,
                };
                this.logger.warn(`CNPJ inválido na planilha para Pedido ${envio.numeroPedido}: ${cnpjDaPlanilha}`);
            }
            else if (cnpjDaPlanilha === cnpjDoVendedor) {
                this.logger.log(`✓ CNPJ validado (direto) para Pedido: ${envio.numeroPedido} (${cnpjDoVendedor})`);
            }
            else {
                this.logger.log(`CNPJ da planilha (${cnpjDaPlanilha}) não bate com Ótica do Vendedor (${cnpjDoVendedor}). Verificando Matriz...`);
                const matriz = envio.vendedor.optica?.matriz;
                const cnpjDaMatriz = this._limparCnpj(matriz?.cnpj);
                if (matriz && cnpjDaMatriz && cnpjDaPlanilha === cnpjDaMatriz) {
                    this.logger.log(`✓ CNPJ validado (via Matriz ${matriz.nome}) para Pedido: ${envio.numeroPedido} (${cnpjDaMatriz})`);
                }
                else {
                    this.logger.warn(`CNPJ divergente para Pedido: ${envio.numeroPedido}. Planilha: ${cnpjDaPlanilha}, Vendedor: ${cnpjDoVendedor}, Matriz: ${cnpjDaMatriz || 'N/A'}`);
                    resultadoValidacao = {
                        status: 'REJEITADO',
                        motivo: `CNPJ da venda (${cnpjDaPlanilha}) não corresponde à ótica do vendedor (${cnpjDoVendedor}) nem à sua matriz (${cnpjDaMatriz || 'N/A'}).`,
                    };
                }
            }
            if (!resultadoValidacao) {
                this.logger.log(`[2/3] Aplicando regras de negócio (Rule Builder)...`);
                const resultadoRegras = this._aplicarRegras(linhasEncontradas, envio.requisito, mapaInvertido);
                if (!resultadoRegras.sucesso) {
                    resultadoValidacao = {
                        status: 'REJEITADO',
                        motivo: resultadoRegras.motivo,
                    };
                    this.logger.warn(`Regras não satisfeitas para Pedido ${envio.numeroPedido}: ${resultadoRegras.motivo}`);
                }
                else {
                    this.logger.log(`✓ Regras validadas com sucesso para Pedido: ${envio.numeroPedido}`);
                    this.logger.log(`[3/3] Verificando conflito entre vendedores para Pedido: ${envio.numeroPedido}...`);
                    const conflitoOutroVendedor = await this.prisma.envioVenda.findFirst({
                        where: {
                            numeroPedido: envio.numeroPedido,
                            campanhaId: envio.campanhaId,
                            status: 'VALIDADO',
                            vendedorId: { not: envio.vendedorId },
                        },
                    });
                    if (conflitoOutroVendedor) {
                        resultadoValidacao = {
                            status: 'CONFLITO_MANUAL',
                            motivo: `Conflito interno detectado: outro vendedor (ID: ${conflitoOutroVendedor.vendedorId}) já possui este pedido validado.`,
                        };
                        this.logger.warn(`⚠ CONFLITO detectado para Pedido ${envio.numeroPedido}: Vendedor ${conflitoOutroVendedor.vendedorId} já validou.`);
                    }
                    else {
                        resultadoValidacao = {
                            status: 'VALIDADO',
                            motivo: null,
                        };
                        this.logger.log(`✓✓✓ Pedido ${envio.numeroPedido} VALIDADO com sucesso! (CNPJ + Regras + Sem Conflito)`);
                    }
                }
            }
            envio['resultado'] = resultadoValidacao;
            relatorio[resultadoValidacao.status.toLowerCase()]++;
            this.logger.log(`Resultado do Envio ID ${envio.id}: ${resultadoValidacao.status} - ${resultadoValidacao.motivo || 'OK'}`);
        }
        if (!ehSimulacao) {
            this.logger.log(`\n========== PERSISTINDO RESULTADOS NO BANCO ==========`);
            await this._persistirResultados(enviosPendentes);
        }
        else {
            this.logger.log(`\n========== MODO SIMULAÇÃO: Nenhuma alteração persistida ==========`);
        }
        this.logger.log(`\n========== FIM DO PROCESSAMENTO ==========`);
        this.logger.log(`Total processados: ${enviosPendentes.length}`);
        this.logger.log(`Validados: ${relatorio.validado}`);
        this.logger.log(`Rejeitados: ${relatorio.rejeitado}`);
        this.logger.log(`Conflitos Manuais: ${relatorio.conflito_manual}`);
        return {
            mensagem: ehSimulacao
                ? 'Simulação concluída. Nenhuma alteração foi persistida.'
                : 'Processamento concluído com sucesso.',
            totalProcessados: enviosPendentes.length,
            validado: relatorio.validado,
            rejeitado: relatorio.rejeitado,
            conflito_manual: relatorio.conflito_manual,
        };
    }
    _limparCnpj(cnpj) {
        if (!cnpj) {
            return null;
        }
        const cnpjLimpo = String(cnpj).replace(/\D/g, '');
        return cnpjLimpo.length > 0 ? cnpjLimpo : null;
    }
    _buscarPedidoPlanilha(numeroPedido, linhasPlanilha, mapaInvertido) {
        const colunasComPedido = new Set();
        const linhasEncontradas = [];
        const colunasPedido = Object.keys(mapaInvertido).filter((key) => key === 'NUMERO_PEDIDO_OS');
        if (colunasPedido.length === 0) {
            return {
                status: 'PEDIDO_NAO_ENCONTRADO',
                motivo: 'Nenhuma coluna mapeada para NUMERO_PEDIDO_OS.',
                linhasEncontradas: [],
            };
        }
        for (const linha of linhasPlanilha) {
            for (const campoSistema of colunasPedido) {
                const nomeColuna = mapaInvertido[campoSistema];
                const valorCelula = String(linha[nomeColuna] || '').trim();
                if (valorCelula === numeroPedido) {
                    colunasComPedido.add(nomeColuna);
                    linhasEncontradas.push(linha);
                }
            }
        }
        if (colunasComPedido.size === 0) {
            return {
                status: 'PEDIDO_NAO_ENCONTRADO',
                motivo: `Pedido '${numeroPedido}' não encontrado na planilha.`,
                linhasEncontradas: [],
            };
        }
        if (colunasComPedido.size > 1) {
            return {
                status: 'CONFLITO_COLUNA',
                motivo: `Pedido '${numeroPedido}' encontrado em múltiplas colunas: ${Array.from(colunasComPedido).join(', ')}.`,
                linhasEncontradas: [],
            };
        }
        return {
            status: 'OK',
            motivo: null,
            linhasEncontradas: linhasEncontradas,
        };
    }
    _aplicarRegras(linhasEncontradas, requisito, mapaInvertido) {
        if (!requisito || !requisito.condicoes || requisito.condicoes.length === 0) {
            return { sucesso: true, motivo: null };
        }
        for (const condicao of requisito.condicoes) {
            const campoVerificacao = condicao.campo;
            const operador = condicao.operador;
            const valorEsperado = condicao.valor;
            const nomeColuna = mapaInvertido[campoVerificacao];
            if (!nomeColuna) {
                return {
                    sucesso: false,
                    motivo: `Campo '${campoVerificacao}' não mapeado na planilha.`,
                };
            }
            const valorReal = linhasEncontradas[0][nomeColuna];
            let condicaoAtendida = false;
            switch (operador) {
                case 'IGUAL_A':
                    condicaoAtendida = String(valorReal).trim() === String(valorEsperado).trim();
                    break;
                case 'NAO_IGUAL_A':
                    condicaoAtendida = String(valorReal).trim() !== String(valorEsperado).trim();
                    break;
                case 'CONTEM':
                    condicaoAtendida = String(valorReal).includes(String(valorEsperado));
                    break;
                case 'NAO_CONTEM':
                    condicaoAtendida = !String(valorReal).includes(String(valorEsperado));
                    break;
                case 'MAIOR_QUE':
                    condicaoAtendida = parseFloat(valorReal) > parseFloat(valorEsperado);
                    break;
                case 'MENOR_QUE':
                    condicaoAtendida = parseFloat(valorReal) < parseFloat(valorEsperado);
                    break;
                default:
                    return {
                        sucesso: false,
                        motivo: `Operador '${operador}' não reconhecido.`,
                    };
            }
            if (!condicaoAtendida) {
                return {
                    sucesso: false,
                    motivo: `Condição não satisfeita: ${campoVerificacao} ${operador} '${valorEsperado}' (valor encontrado: '${valorReal}').`,
                };
            }
        }
        return { sucesso: true, motivo: null };
    }
    async _persistirResultados(enviosPendentes) {
        for (const envio of enviosPendentes) {
            const resultado = envio['resultado'];
            if (resultado.status === 'VALIDADO') {
                await this.prisma.$transaction(async (tx) => {
                    const countValidado = await tx.envioVenda.count({
                        where: {
                            vendedorId: envio.vendedorId,
                            requisitoId: envio.requisito.id,
                            status: 'VALIDADO',
                        },
                    });
                    const quantidadeRequisito = envio.requisito.quantidade;
                    const numeroCartelaAtendida = Math.floor(countValidado / quantidadeRequisito) + 1;
                    this.logger.log(`[SPILLOVER] Envio ${envio.id}: countValidado=${countValidado}, quantidade=${quantidadeRequisito}, numeroCartela=${numeroCartelaAtendida}`);
                    const envioAtualizado = await tx.envioVenda.update({
                        where: { id: envio.id },
                        data: {
                            status: 'VALIDADO',
                            motivoRejeicao: null,
                            dataValidacao: new Date(),
                            numeroCartelaAtendida: numeroCartelaAtendida,
                        },
                    });
                    this.logger.log(`Envio ID ${envio.id} atualizado para VALIDADO (Cartela ${numeroCartelaAtendida}).`);
                    this.logger.log(`Disparando gatilhos de recompensa para Envio ID ${envioAtualizado.id}...`);
                    const campanha = envio.requisito.regraCartela.campanha;
                    const vendedor = envio.vendedor;
                    if (!campanha || !vendedor) {
                        this.logger.error(`Dados incompletos para processar recompensa do Envio ID ${envio.id}. Campanha ou Vendedor ausentes.`);
                        throw new Error(`Falha ao obter dados completos para recompensa do Envio ${envio.id}.`);
                    }
                    await this.recompensaService.processarGatilhos(tx, envioAtualizado, campanha, vendedor);
                    this.logger.log(`Gatilhos de recompensa processados para Envio ID ${envioAtualizado.id}.`);
                });
            }
            else {
                await this.prisma.envioVenda.update({
                    where: { id: envio.id },
                    data: {
                        status: resultado.status,
                        motivoRejeicao: resultado.motivo,
                    },
                });
                this.logger.log(`Envio ID ${envio.id} atualizado para ${resultado.status}. Motivo: ${resultado.motivo}`);
            }
        }
    }
};
exports.ValidacaoService = ValidacaoService;
exports.ValidacaoService = ValidacaoService = ValidacaoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        recompensa_service_1.RecompensaService])
], ValidacaoService);
//# sourceMappingURL=validacao.service.js.map