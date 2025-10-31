import { StatusEnvioVenda } from '@prisma/client';
export declare class ListarEnviosFiltroDto {
    status?: StatusEnvioVenda;
    campanhaId?: string;
    vendedorId?: string;
}
