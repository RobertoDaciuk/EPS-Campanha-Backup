import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getVendedorDashboard(req: any): Promise<{
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        posicaoRanking: number;
        totalCampanhasAtivas: number;
    }>;
    getGerenteDashboard(req: any): Promise<{
        melhorVendedor: {
            id: string;
            nome: string;
            avatarUrl: string;
            rankingMoedinhas: number;
        };
        ganhosPendentesGerencia: number | import("@prisma/client/runtime/library").Decimal;
        rankingEquipe: {
            id: string;
            nome: string;
            avatarUrl: string;
            rankingMoedinhas: number;
        }[];
    }>;
    getAdminDashboard(): Promise<{
        totalUsuarios: number;
        totalCampanhasAtivas: number;
        totalVendasValidadas: number;
        totalMoedinhasDistribuidas: number;
        totalFinanceiroPendente: number | import("@prisma/client/runtime/library").Decimal;
    }>;
}
