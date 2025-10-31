import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getKpisAdmin(): Promise<{
        usuariosPendentes: number;
        vendasEmAnalise: number;
        resgatesSolicitados: number;
        oticasAtivas: number;
    }>;
    getKpisGerente(usuarioId: string): Promise<{
        totalVendedores: number;
        vendasTimeAnalise: number;
        comissaoPendente: number;
        totalMoedinhasTime: number;
    }>;
    getKpisVendedor(usuarioId: string): Promise<{
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        vendasAprovadas: number;
        cartelasCompletas: number;
        posicaoRanking: number;
    }>;
}
