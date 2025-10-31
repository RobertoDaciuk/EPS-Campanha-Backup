import { Prisma, Usuario, Campanha, EnvioVenda } from '@prisma/client';
export declare class RecompensaService {
    private readonly logger;
    processarGatilhos(tx: Prisma.TransactionClient, envioValidado: EnvioVenda, campanha: Campanha, vendedor: Usuario & {
        gerente: Usuario | null;
    }): Promise<void>;
    private _verificarCartelaCompleta;
    private _aplicarRecompensas;
}
