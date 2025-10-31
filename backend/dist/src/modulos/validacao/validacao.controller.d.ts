import { ValidacaoService } from './validacao.service';
import { ProcessarValidacaoDto } from './dto/processar-validacao.dto';
export declare class ValidacaoController {
    private readonly validacaoService;
    private readonly logger;
    constructor(validacaoService: ValidacaoService);
    processarPlanilha(dto: ProcessarValidacaoDto): Promise<{
        mensagem: string;
        totalProcessados: number;
        validado: number;
        rejeitado: number;
        conflito_manual: number;
    }>;
}
