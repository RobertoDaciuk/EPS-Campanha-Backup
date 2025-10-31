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
const prisma_module_1 = require("./prisma/prisma.module");
const otica_module_1 = require("./modulos/oticas/otica.module");
const autenticacao_module_1 = require("./modulos/autenticacao/autenticacao.module");
const usuario_module_1 = require("./modulos/usuarios/usuario.module");
const campanha_module_1 = require("./modulos/campanhas/campanha.module");
const envio_venda_module_1 = require("./modulos/envio-venda/envio-venda.module");
const validacao_module_1 = require("./modulos/validacao/validacao.module");
const recompensa_module_1 = require("./modulos/recompensa/recompensa.module");
const relatorio_financeiro_module_1 = require("./modulos/relatorio-financeiro/relatorio-financeiro.module");
const premio_module_1 = require("./modulos/premios/premio.module");
const resgate_module_1 = require("./modulos/resgates/resgate.module");
const notificacao_module_1 = require("./modulos/notificacoes/notificacao.module");
const dashboard_module_1 = require("./modulos/dashboard/dashboard.module");
const ranking_module_1 = require("./modulos/ranking/ranking.module");
const upload_module_1 = require("./modulos/upload/upload.module");
const configuracao_module_1 = require("./modulos/configuracao/configuracao.module");
const perfil_module_1 = require("./modulos/perfil/perfil.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                cache: true,
            }),
            prisma_module_1.PrismaModule,
            otica_module_1.OticaModule,
            autenticacao_module_1.AutenticacaoModule,
            usuario_module_1.UsuarioModule,
            campanha_module_1.CampanhaModule,
            envio_venda_module_1.EnvioVendaModule,
            validacao_module_1.ValidacaoModule,
            recompensa_module_1.RecompensaModule,
            relatorio_financeiro_module_1.RelatorioFinanceiroModule,
            premio_module_1.PremioModule,
            resgate_module_1.ResgateModule,
            notificacao_module_1.NotificacaoModule,
            dashboard_module_1.DashboardModule,
            ranking_module_1.RankingModule,
            upload_module_1.UploadModule,
            configuracao_module_1.ConfiguracaoModule,
            perfil_module_1.PerfilModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map