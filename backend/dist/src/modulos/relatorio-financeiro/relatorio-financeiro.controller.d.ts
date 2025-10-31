import { RelatorioFinanceiroService } from './relatorio-financeiro.service';
import { ListarRelatoriosFiltroDto } from './dto/listar-relatorios.filtro.dto';
export declare class RelatorioFinanceiroController {
    private readonly relatorioService;
    constructor(relatorioService: RelatorioFinanceiroService);
    listar(filtros: ListarRelatoriosFiltroDto): Promise<({
        usuario: {
            id: string;
            email: string;
            nome: string;
        };
        campanha: {
            id: string;
            titulo: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.StatusPagamento;
        criadoEm: Date;
        atualizadoEm: Date;
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
            email: string;
            nome: string;
        };
        campanha: {
            id: string;
            titulo: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.StatusPagamento;
        criadoEm: Date;
        atualizadoEm: Date;
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
        status: import(".prisma/client").$Enums.StatusPagamento;
        criadoEm: Date;
        atualizadoEm: Date;
        campanhaId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        tipo: string;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
        usuarioId: string;
    }>;
}
