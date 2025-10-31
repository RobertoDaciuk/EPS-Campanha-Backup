import { StatusPagamento } from '@prisma/client';
export declare class ListarRelatoriosFiltroDto {
    status?: StatusPagamento;
    campanhaId?: string;
    usuarioId?: string;
    tipo?: string;
    dataInicio?: string;
    dataFim?: string;
}
