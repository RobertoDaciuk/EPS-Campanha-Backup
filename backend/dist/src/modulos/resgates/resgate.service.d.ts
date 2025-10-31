import { PrismaService } from '../../prisma/prisma.service';
import { SolicitarResgateDto } from './dto/solicitar-resgate.dto';
import { ListarResgatesFiltroDto } from './dto/listar-resgates.filtro.dto';
import { CancelarResgateDto } from './dto/cancelar-resgate.dto';
export declare class ResgateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    solicitar(dto: SolicitarResgateDto, vendedorId: string): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusResgate;
        vendedorId: string;
        premioId: string;
        motivoCancelamento: string | null;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
    }>;
    listarAdmin(filtros: ListarResgatesFiltroDto): Promise<({
        premio: {
            id: string;
            nome: string;
        };
        vendedor: {
            id: string;
            nome: string;
            email: string;
        };
    } & {
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusResgate;
        vendedorId: string;
        premioId: string;
        motivoCancelamento: string | null;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
    })[]>;
    meusResgates(vendedorId: string): Promise<({
        premio: {
            id: string;
            nome: string;
            imageUrl: string;
        };
    } & {
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusResgate;
        vendedorId: string;
        premioId: string;
        motivoCancelamento: string | null;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
    })[]>;
    marcarEnviado(resgateId: string): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusResgate;
        vendedorId: string;
        premioId: string;
        motivoCancelamento: string | null;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
    }>;
    cancelarEstorno(resgateId: string, dto: CancelarResgateDto): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusResgate;
        vendedorId: string;
        premioId: string;
        motivoCancelamento: string | null;
        dataSolicitacao: Date;
        dataAtualizacao: Date;
    }>;
}
