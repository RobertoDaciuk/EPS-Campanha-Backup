"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        logger.log('🚀 Iniciando aplicação EPS Campanhas...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        logger.log('✅ Instância da aplicação criada com sucesso');
        const configService = app.get(config_1.ConfigService);
        const porta = configService.get('PORT') || 3000;
        app.enableCors({
            origin: configService.get('CORS_ORIGIN') || 'http://localhost:3001',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        });
        logger.log('✅ CORS habilitado');
        app.setGlobalPrefix('api');
        logger.log('✅ Prefixo global "/api" configurado');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }));
        logger.log('✅ Validação automática de DTOs habilitada');
        await app.listen(porta);
        logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.log('🎉 Servidor EPS Campanhas está rodando!');
        logger.log(`🌐 URL: http://localhost:${porta}/api`);
        logger.log(`📦 Ambiente: ${configService.get('NODE_ENV') || 'development'}`);
        logger.log(`🗄️  Banco: PostgreSQL (Prisma conectado)`);
        logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    catch (erro) {
        logger.error('❌ Erro crítico ao inicializar a aplicação:', erro);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map