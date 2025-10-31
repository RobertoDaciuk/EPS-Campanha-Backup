import { PrismaService } from '../../prisma/prisma.service';
import { ListarRelatoriosFiltroDto } from './dto/listar-relatorios.filtro.dto';
import { Prisma } from '@prisma/client';
export declare class RelatorioFinanceiroService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        valor: Prisma.Decimal;
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
        valor: Prisma.Decimal;
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
        valor: Prisma.Decimal;
        tipo: string;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
        usuarioId: string;
    }>;
}
