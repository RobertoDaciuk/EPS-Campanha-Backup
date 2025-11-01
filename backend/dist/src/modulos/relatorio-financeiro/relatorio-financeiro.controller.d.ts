import { RelatorioFinanceiroService } from './relatorio-financeiro.service';
import { ListarRelatoriosFiltroDto } from './dto/listar-relatorios.filtro.dto';
export declare class RelatorioFinanceiroController {
    private readonly relatorioService;
    constructor(relatorioService: RelatorioFinanceiroService);
    listar(filtros: ListarRelatoriosFiltroDto): Promise<({
        usuario: {
            nome: string;
            email: string;
            id: string;
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
        tipo: string;
        usuarioId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
        campanhaId: string;
    })[]>;
    buscarPorId(id: string): Promise<{
        usuario: {
            nome: string;
            email: string;
            id: string;
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
        tipo: string;
        usuarioId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
        campanhaId: string;
    }>;
    marcarComoPago(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusPagamento;
        criadoEm: Date;
        atualizadoEm: Date;
        tipo: string;
        usuarioId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
        campanhaId: string;
    }>;
}
