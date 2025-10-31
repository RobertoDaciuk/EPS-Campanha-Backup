import { PrismaService } from '../../prisma/prisma.service';
import { RankingService } from './../ranking/ranking.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly rankingService;
    constructor(prisma: PrismaService, rankingService: RankingService);
    getVendedorKpis(usuarioId: string): Promise<{
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        posicaoRanking: number;
        totalCampanhasAtivas: number;
    }>;
    getGerenteKpis(usuarioId: string): Promise<{
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
    getAdminKpis(): Promise<{
        totalUsuarios: number;
        totalCampanhasAtivas: number;
        totalVendasValidadas: number;
        totalMoedinhasDistribuidas: number;
        totalFinanceiroPendente: number | import("@prisma/client/runtime/library").Decimal;
    }>;
}
