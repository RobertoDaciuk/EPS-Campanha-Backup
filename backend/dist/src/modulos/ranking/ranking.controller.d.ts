import { RankingService } from './ranking.service';
import { PaginacaoRankingDto } from './dto/paginacao-ranking.dto';
export declare class RankingController {
    private readonly rankingService;
    private readonly logger;
    constructor(rankingService: RankingService);
    getRankingGeral(paginacaoDto: PaginacaoRankingDto): Promise<{
        dados: {
            posicao: number;
            id: string;
            nome: string;
            optica: {
                nome: string;
            };
            avatarUrl: string;
            rankingMoedinhas: number;
            nivel: import(".prisma/client").$Enums.NivelVendedor;
        }[];
        paginaAtual: number;
        totalPaginas: number;
        totalRegistros: number;
    }>;
    getRankingPorFilial(req: any): Promise<any>;
}
