import { PrismaService } from '../../prisma/prisma.service';
import { ListarRelatoriosFiltroDto } from './dto/listar-relatorios.filtro.dto';
import { Prisma } from '@prisma/client';
export declare class RelatorioFinanceiroService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        valor: Prisma.Decimal;
        tipo: string;
        usuarioId: string;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
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
        valor: Prisma.Decimal;
        tipo: string;
        usuarioId: string;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
    }>;
    marcarComoPago(id: string): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusPagamento;
        campanhaId: string;
        valor: Prisma.Decimal;
        tipo: string;
        usuarioId: string;
        dataGerado: Date;
        dataPagamento: Date | null;
        observacoes: string | null;
    }>;
}
