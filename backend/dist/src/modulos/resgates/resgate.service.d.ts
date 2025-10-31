import { PrismaService } from '../../prisma/prisma.service';
import { SolicitarResgateDto } from './dto/solicitar-resgate.dto';
import { ListarResgatesFiltroDto } from './dto/listar-resgates.filtro.dto';
import { CancelarResgateDto } from './dto/cancelar-resgate.dto';
export declare class ResgateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    solicitar(dto: SolicitarResgateDto, vendedorId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusResgate;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        premioId: string;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
        motivoCancelamento: string | null;
    }>;
    listarAdmin(filtros: ListarResgatesFiltroDto): Promise<({
        premio: {
            id: string;
            nome: string;
        };
        vendedor: {
            id: string;
            email: string;
            nome: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.StatusResgate;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        premioId: string;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
        motivoCancelamento: string | null;
    })[]>;
    meusResgates(vendedorId: string): Promise<({
        premio: {
            id: string;
            nome: string;
            imageUrl: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.StatusResgate;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        premioId: string;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
        motivoCancelamento: string | null;
    })[]>;
    marcarEnviado(resgateId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusResgate;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        premioId: string;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
        motivoCancelamento: string | null;
    }>;
    cancelarEstorno(resgateId: string, dto: CancelarResgateDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusResgate;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        premioId: string;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
        motivoCancelamento: string | null;
    }>;
}
