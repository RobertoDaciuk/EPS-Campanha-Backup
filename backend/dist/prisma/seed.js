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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const SENHA_PADRAO = 'Senha@123';
const NUM_VENDEDORES = 16;
async function main() {
    console.log(`🌱 Iniciando o processo de seeding...`);
    console.log(`🔑 Senha padrão para usuários criados: ${SENHA_PADRAO}`);
    console.log('🧹 Limpando dados antigos (se existirem)...');
    await prisma.cartelaConcluida.deleteMany({});
    await prisma.notificacao.deleteMany({});
    await prisma.relatorioFinanceiro.deleteMany({});
    await prisma.resgatePremio.deleteMany({});
    await prisma.premio.deleteMany({});
    await prisma.envioVenda.deleteMany({});
    await prisma.condicaoRequisito.deleteMany({});
    await prisma.requisitoCartela.deleteMany({});
    await prisma.regraCartela.deleteMany({});
    await prisma.campanha.deleteMany({});
    await prisma.usuario.deleteMany({});
    await prisma.optica.deleteMany({});
    await prisma.configuracaoGlobal.deleteMany({});
    console.log('🗑️ Dados antigos limpos.');
    const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);
    console.log(`🔒 Senha padrão hasheada.`);
    console.log('🏢 Criando Óticas (Matriz e Filiais)...');
    const opticaMatriz = await prisma.optica.create({
        data: {
            cnpj: '11111111000111',
            nome: 'Ótica Matriz Principal',
            ehMatriz: true,
            ativa: true,
        },
    });
    const opticaFilialA = await prisma.optica.create({
        data: {
            cnpj: '22222222000122',
            nome: 'Ótica Filial Alfa',
            ativa: true,
            matrizId: opticaMatriz.id,
        },
    });
    const opticaFilialB = await prisma.optica.create({
        data: {
            cnpj: '33333333000133',
            nome: 'Ótica Filial Beta',
            ativa: true,
            matrizId: opticaMatriz.id,
        },
    });
    const opticaIsolada = await prisma.optica.create({
        data: {
            cnpj: '44444444000144',
            nome: 'Ótica Independente Delta',
            ativa: true,
        },
    });
    console.log(`✨ Óticas criadas: Matriz(${opticaMatriz.id}), FilialA(${opticaFilialA.id}), FilialB(${opticaFilialB.id}), Isolada(${opticaIsolada.id})`);
    console.log(`👤 Criando ${1 + 3 + NUM_VENDEDORES} Usuários...`);
    const admin = await prisma.usuario.create({
        data: {
            nome: 'Admin Supremo EPS',
            email: 'admin@eps.com.br',
            senhaHash: senhaHash,
            papel: client_1.PapelUsuario.ADMIN,
            status: client_1.StatusUsuario.ATIVO,
        },
    });
    const gerenteMatriz = await prisma.usuario.create({
        data: {
            nome: 'Gerente Matriz',
            email: 'gerente.matriz@eps.com.br',
            senhaHash: senhaHash,
            papel: client_1.PapelUsuario.GERENTE,
            status: client_1.StatusUsuario.ATIVO,
            opticaId: opticaMatriz.id,
        },
    });
    const gerenteFilialA = await prisma.usuario.create({
        data: {
            nome: 'Gerente Filial Alfa',
            email: 'gerente.alfa@eps.com.br',
            senhaHash: senhaHash,
            papel: client_1.PapelUsuario.GERENTE,
            status: client_1.StatusUsuario.ATIVO,
            opticaId: opticaFilialA.id,
        },
    });
    const gerenteFilialB = await prisma.usuario.create({
        data: {
            nome: 'Gerente Filial Beta',
            email: 'gerente.beta@eps.com.br',
            senhaHash: senhaHash,
            papel: client_1.PapelUsuario.GERENTE,
            status: client_1.StatusUsuario.ATIVO,
            opticaId: opticaFilialB.id,
        },
    });
    const vendedores = [];
    const gerentes = [gerenteMatriz, gerenteFilialA, gerenteFilialB];
    const oticas = [opticaMatriz, opticaFilialA, opticaFilialB, opticaIsolada];
    for (let i = 1; i <= NUM_VENDEDORES; i++) {
        const gerenteIndex = i % gerentes.length;
        const oticaIndex = i % oticas.length;
        const nome = `Vendedor ${String(i).padStart(2, '0')}`;
        const email = `vendedor${String(i).padStart(2, '0')}@eps.com.br`;
        const rankingMoedinhas = Math.floor(Math.random() * 5000) + 500;
        let nivel = client_1.NivelVendedor.BRONZE;
        if (rankingMoedinhas >= 10000)
            nivel = client_1.NivelVendedor.DIAMANTE;
        else if (rankingMoedinhas >= 5000)
            nivel = client_1.NivelVendedor.OURO;
        else if (rankingMoedinhas >= 1000)
            nivel = client_1.NivelVendedor.PRATA;
        const vendedor = await prisma.usuario.create({
            data: {
                nome: nome,
                email: email,
                senhaHash: senhaHash,
                papel: client_1.PapelUsuario.VENDEDOR,
                status: client_1.StatusUsuario.ATIVO,
                opticaId: oticas[oticaIndex].id,
                gerenteId: gerentes[gerenteIndex].id,
                saldoMoedinhas: Math.floor(Math.random() * 1000),
                rankingMoedinhas: rankingMoedinhas,
                nivel: nivel,
            },
        });
        vendedores.push(vendedor);
    }
    console.log(`✨ Usuários criados: 1 Admin, 3 Gerentes, ${NUM_VENDEDORES} Vendedores.`);
    console.log('🎯 Criando Campanhas de Teste...');
    const hoje = new Date();
    const fimDoAno = new Date(hoje.getFullYear(), 11, 31);
    const campanhaTarget = await prisma.campanha.create({
        data: {
            titulo: 'Campanha Foco Matriz+Alfa (Seed)',
            descricao: 'Campanha direcionada apenas para a Matriz e Filial Alfa.',
            dataInicio: hoje,
            dataFim: fimDoAno,
            pontosReaisPorCartela: 75.0,
            moedinhasPorCartela: 150,
            percentualGerente: 0.05,
            status: 'ATIVA',
            paraTodasOticas: false,
            oticasAlvo: {
                connect: [{ id: opticaMatriz.id }, { id: opticaFilialA.id }],
            },
            cartelas: {
                create: [
                    {
                        numeroCartela: 1,
                        descricao: 'Meta Principal',
                        requisitos: {
                            create: [
                                {
                                    descricao: 'Vender Kit Premium (Seed)',
                                    quantidade: 3,
                                    tipoUnidade: client_1.TipoUnidade.UNIDADE,
                                    ordem: 1,
                                    condicoes: {
                                        create: [
                                            { campo: client_1.CampoVerificacao.NOME_PRODUTO, operador: client_1.OperadorCondicao.CONTEM, valor: 'Kit Premium' },
                                            { campo: client_1.CampoVerificacao.VALOR_VENDA, operador: client_1.OperadorCondicao.MAIOR_QUE, valor: '200' },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });
    console.log(`✨ Campanha Direcionada criada: ${campanhaTarget.titulo}`);
    const campanhaGlobal = await prisma.campanha.create({
        data: {
            titulo: 'Campanha Global Spillover (Seed)',
            descricao: 'Campanha para todas as óticas, com 2 cartelas para testar spillover.',
            dataInicio: hoje,
            dataFim: fimDoAno,
            pontosReaisPorCartela: 30.0,
            moedinhasPorCartela: 60,
            percentualGerente: 0.10,
            status: 'ATIVA',
            paraTodasOticas: true,
            cartelas: {
                create: [
                    {
                        numeroCartela: 1,
                        requisitos: {
                            create: [
                                {
                                    descricao: 'Lente Simples (Seed)',
                                    quantidade: 2,
                                    tipoUnidade: client_1.TipoUnidade.UNIDADE,
                                    ordem: 1,
                                    condicoes: { create: [{ campo: client_1.CampoVerificacao.NOME_PRODUTO, operador: client_1.OperadorCondicao.CONTEM, valor: 'Lente Simples' }] },
                                },
                            ],
                        },
                    },
                    {
                        numeroCartela: 2,
                        requisitos: {
                            create: [
                                {
                                    descricao: 'Lente Simples (Seed)',
                                    quantidade: 2,
                                    tipoUnidade: client_1.TipoUnidade.UNIDADE,
                                    ordem: 1,
                                    condicoes: { create: [{ campo: client_1.CampoVerificacao.NOME_PRODUTO, operador: client_1.OperadorCondicao.CONTEM, valor: 'Lente Simples' }] },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });
    console.log(`✨ Campanha Global criada: ${campanhaGlobal.titulo}`);
    console.log('🎁 Criando Prêmios de Teste...');
    await prisma.premio.createMany({
        data: [
            {
                nome: 'Caneca Exclusiva EPS (Seed)',
                descricao: 'Caneca para teste de resgate.',
                custoMoedinhas: 100,
                estoque: 20,
                ativo: true,
            },
            {
                nome: 'Fone Bluetooth (Seed)',
                descricao: 'Fone de ouvido sem fio.',
                custoMoedinhas: 1000,
                estoque: 5,
                ativo: true,
            },
            {
                nome: 'Prêmio Sem Estoque (Seed)',
                descricao: 'Para testar validação de estoque.',
                custoMoedinhas: 50,
                estoque: 0,
                ativo: true,
            },
        ],
        skipDuplicates: true,
    });
    console.log('✨ Prêmios criados.');
    console.log('⚙️ Criando Configurações Globais de Teste...');
    await prisma.configuracaoGlobal.createMany({
        data: [
            { chave: 'PONTOS_NIVEL_PRATA', valor: '1000', descricao: 'Moedinhas para atingir Prata (Seed)' },
            { chave: 'PONTOS_NIVEL_OURO', valor: '5000', descricao: 'Moedinhas para atingir Ouro (Seed)' },
            { chave: 'PONTOS_NIVEL_DIAMANTE', valor: '10000', descricao: 'Moedinhas para atingir Diamante (Seed)' },
            { chave: 'PERCENTUAL_MAX_GERENTE', valor: '0.15', descricao: 'Comissão máxima do gerente (15%) (Seed)' },
        ],
        skipDuplicates: true,
    });
    console.log('✨ Configurações criadas.');
    console.log(`\n✅ Seeding concluído com sucesso!`);
}
main()
    .catch((e) => {
    console.error('❌ Erro durante o seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Conexão com o banco de dados fechada.');
});
//# sourceMappingURL=seed.js.map