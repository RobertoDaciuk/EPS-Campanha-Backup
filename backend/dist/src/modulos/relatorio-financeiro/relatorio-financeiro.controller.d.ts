import { RelatorioFinanceiroService } from './relatorio-financeiro.service';
import { ListarRelatoriosFiltroDto } from './dto/listar-relatorios.filtro.dto';
export declare class RelatorioFinanceiroController {
    private readonly relatorioService;
    constructor(relatorioService: RelatorioFinanceiroService);
    listar(filtros: ListarRelatoriosFiltroDto): Promise<({
        usuario: {
            id: string;
            nome: string;
            email: string;
        };
        campanha: {
            id: string;
            titulo: string;
        };
    } & {
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusPagamento;
        campanhaId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        tipo: string;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
        usuarioId: string;
    })[]>;
    buscarPorId(id: string): Promise<{
        usuario: {
            id: string;
            nome: string;
            email: string;
        };
        campanha: {
            id: string;
            titulo: string;
        };
    } & {
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusPagamento;
        campanhaId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        tipo: string;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
        usuarioId: string;
    }>;
    marcarComoPago(id: string): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusPagamento;
        campanhaId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        tipo: string;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
        usuarioId: string;
    }>;
}
