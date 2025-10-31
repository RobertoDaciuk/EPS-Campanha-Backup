"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const autenticacao_module_1 = require("./modulos/autenticacao/autenticacao.module");
const usuario_module_1 = require("./modulos/usuarios/usuario.module");
const otica_module_1 = require("./modulos/oticas/otica.module");
const perfil_module_1 = require("./modulos/perfil/perfil.module");
const campanha_module_1 = require("./modulos/campanhas/campanha.module");
const premio_module_1 = require("./modulos/premios/premio.module");
const resgate_module_1 = require("./modulos/resgates/resgate.module");
const ranking_module_1 = require("./modulos/ranking/ranking.module");
const dashboard_module_1 = require("./modulos/dashboard/dashboard.module");
const envio_venda_module_1 = require("./modulos/envio-venda/envio-venda.module");
const validacao_module_1 = require("./modulos/validacao/validacao.module");
const recompensa_module_1 = require("./modulos/recompensa/recompensa.module");
const notificacao_module_1 = require("./modulos/notificacoes/notificacao.module");
const relatorio_financeiro_module_1 = require("./modulos/relatorio-financeiro/relatorio-financeiro.module");
const configuracao_module_1 = require("./modulos/configuracao/configuracao.module");
const upload_module_1 = require("./modulos/upload/upload.module");
const jwt_auth_guard_1 = require("./modulos/comum/guards/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
            prisma_module_1.PrismaModule,
            autenticacao_module_1.AutenticacaoModule,
            usuario_module_1.UsuarioModule,
            otica_module_1.OticaModule,
            perfil_module_1.PerfilModule,
            campanha_module_1.CampanhaModule,
            premio_module_1.PremioModule,
            resgate_module_1.ResgateModule,
            ranking_module_1.RankingModule,
            dashboard_module_1.DashboardModule,
            envio_venda_module_1.EnvioVendaModule,
            validacao_module_1.ValidacaoModule,
            recompensa_module_1.RecompensaModule,
            notificacao_module_1.NotificacaoModule,
            relatorio_financeiro_module_1.RelatorioFinanceiroModule,
            configuracao_module_1.ConfiguracaoModule,
            upload_module_1.UploadModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map