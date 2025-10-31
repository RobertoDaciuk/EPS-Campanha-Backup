import { ConfiguracaoService } from './configuracao.service';
import { AtualizarConfiguracoesDto } from './dto/atualizar-configuracoes.dto';
export declare class ConfiguracaoController {
    private readonly service;
    constructor(service: ConfiguracaoService);
    listar(): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        valor: string;
        chave: string;
    }[]>;
    atualizarEmLote(dto: AtualizarConfiguracoesDto): Promise<any[]>;
}
