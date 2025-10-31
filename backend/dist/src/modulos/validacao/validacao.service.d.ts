import { PrismaService } from '../../prisma/prisma.service';
import { ProcessarValidacaoDto } from './dto/processar-validacao.dto';
import { RecompensaService } from '../recompensa/recompensa.service';
export declare class ValidacaoService {
    private readonly prisma;
    private readonly recompensaService;
    private readonly logger;
    constructor(prisma: PrismaService, recompensaService: RecompensaService);
    processarPlanilha(dto: ProcessarValidacaoDto): Promise<{
        mensagem: string;
        totalProcessados: number;
        validado: number;
        rejeitado: number;
        conflito_manual: number;
    }>;
    private _limparCnpj;
    private _buscarPedidoPlanilha;
    private _aplicarRegras;
    private _persistirResultados;
}
