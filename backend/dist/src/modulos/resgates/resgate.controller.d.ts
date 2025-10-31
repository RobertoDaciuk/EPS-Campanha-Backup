import { ResgateService } from './resgate.service';
import { SolicitarResgateDto } from './dto/solicitar-resgate.dto';
import { ListarResgatesFiltroDto } from './dto/listar-resgates.filtro.dto';
import { CancelarResgateDto } from './dto/cancelar-resgate.dto';
export declare class ResgateController {
    private readonly resgateService;
    constructor(resgateService: ResgateService);
    solicitar(dto: SolicitarResgateDto, req: any): Promise<{
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
    meusResgates(req: any): Promise<({
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
    marcarEnviado(id: string): Promise<{
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
    cancelarEstorno(id: string, dto: CancelarResgateDto): Promise<{
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
