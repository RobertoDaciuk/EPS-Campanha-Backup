import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarConfiguracoesDto } from './dto/atualizar-configuracoes.dto';
export declare class ConfiguracaoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
