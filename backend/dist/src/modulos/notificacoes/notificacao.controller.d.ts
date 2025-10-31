import { NotificacaoService } from './notificacao.service';
export declare class NotificacaoController {
    private readonly notificacaoService;
    constructor(notificacaoService: NotificacaoService);
    private getUsuarioId;
    listar(req: any): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        usuarioId: string;
        mensagem: string;
        lida: boolean;
        linkUrl: string | null;
        dataCriacao: Date;
    }[]>;
    contagemNaoLidas(req: any): Promise<{
        contagem: number;
    }>;
    marcarComoLida(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    marcarTodasComoLidas(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
