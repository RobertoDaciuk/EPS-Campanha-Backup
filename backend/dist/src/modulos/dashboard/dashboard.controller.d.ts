import { DashboardService } from './dashboard.service';
import { PapelUsuario } from '@prisma/client';
interface UsuarioAutenticado {
    id: string;
    email: string;
    papel: PapelUsuario;
}
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getKpis(req: {
        user: UsuarioAutenticado;
    }): Promise<{
        usuariosPendentes: number;
        vendasEmAnalise: number;
        resgatesSolicitados: number;
        oticasAtivas: number;
    } | {
        totalVendedores: number;
        vendasTimeAnalise: number;
        comissaoPendente: number;
        totalMoedinhasTime: number;
    } | {
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        vendasAprovadas: number;
        cartelasCompletas: number;
        posicaoRanking: number;
    }>;
}
export {};
