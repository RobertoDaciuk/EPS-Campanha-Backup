import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificacaoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listar(usuarioId: string): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        usuarioId: string;
        mensagem: string;
        lida: boolean;
        linkUrl: string | null;
        dataCriacao: Date;
    }[]>;
    contagemNaoLidas(usuarioId: string): Promise<{
        contagem: number;
    }>;
    marcarComoLida(notificacaoId: string, usuarioId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    marcarTodasComoLidas(usuarioId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
