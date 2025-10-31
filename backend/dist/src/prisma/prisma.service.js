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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
            errorFormat: 'colorless',
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
        this.$on('query', (e) => {
            this.logger.debug(`Query: ${e.query}`);
            this.logger.debug(`Params: ${e.params}`);
            this.logger.debug(`Duration: ${e.duration}ms`);
        });
    }
    async onModuleInit() {
        try {
            this.logger.log('Conectando ao banco de dados PostgreSQL...');
            await this.$connect();
            this.logger.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
        }
        catch (erro) {
            this.logger.error('❌ Falha ao conectar ao banco de dados PostgreSQL', erro);
            throw new Error(`Erro crítico: Não foi possível conectar ao banco de dados. ${erro.message}`);
        }
    }
    async onModuleDestroy() {
        try {
            this.logger.log('Desconectando do banco de dados PostgreSQL...');
            await this.$disconnect();
            this.logger.log('✅ Desconexão do PostgreSQL realizada com sucesso!');
        }
        catch (erro) {
            this.logger.warn('⚠️ Aviso ao desconectar do banco de dados', erro);
        }
    }
    async limparBancoDeDados() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('⛔ BLOQUEADO: Não é permitido limpar banco em produção!');
        }
        this.logger.warn('🧹 Limpando banco de dados (APENAS DESENVOLVIMENTO)...');
        await this.$transaction([
            this.notificacao.deleteMany(),
            this.resgatePremio.deleteMany(),
            this.relatorioFinanceiro.deleteMany(),
            this.envioVenda.deleteMany(),
            this.requisitoCartela.deleteMany(),
            this.regraCartela.deleteMany(),
            this.campanha.deleteMany(),
            this.premio.deleteMany(),
            this.usuario.deleteMany(),
            this.configuracaoGlobal.deleteMany(),
        ]);
        this.logger.log('✅ Banco de dados limpo com sucesso!');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map