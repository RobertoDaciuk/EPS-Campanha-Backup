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
        nome: string;
        id: string;
        avatarUrl: string;
        rankingMoedinhas: number;
    }[]>;
    getRankingGeralPaginado(dto: PaginacaoRankingDto): Promise<{
        dados: {
            posicao: number;
            nome: string;
            optica: {
                nome: string;
            };
            id: string;
            avatarUrl: string;
            rankingMoedinhas: number;
            nivel: import(".prisma/client").$Enums.NivelVendedor;
        }[];
        paginaAtual: number;
        totalPaginas: number;
        totalRegistros: number;
    }>;
    getRankingFiliaisParaMatriz(matrizGerenteId: string): Promise<any>;
}
