import { PrismaService } from '../../prisma/prisma.service';
import { PaginacaoRankingDto } from './dto/paginacao-ranking.dto';
export declare class RankingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getPosicaoUsuario(usuarioId: string): Promise<{
        posicao: number;
    }>;
    getRankingEquipe(gerenteId: string): Promise<{
        id: string;
        nome: string;
        avatarUrl: string;
        rankingMoedinhas: number;
    }[]>;
    getRankingGeralPaginado(dto: PaginacaoRankingDto): Promise<{
        dados: {
            posicao: number;
            id: string;
            nome: string;
            avatarUrl: string;
            rankingMoedinhas: number;
            nivel: import(".prisma/client").$Enums.NivelVendedor;
            optica: {
                nome: string;
            };
        }[];
        paginaAtual: number;
        totalPaginas: number;
        totalRegistros: number;
    }>;
    getRankingFiliaisParaMatriz(matrizGerenteId: string): Promise<any>;
}
