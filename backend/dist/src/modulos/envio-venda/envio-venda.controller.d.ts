import { EnvioVendaService } from './envio-venda.service';
import { CriarEnvioVendaDto } from './dto/criar-envio-venda.dto';
import { ListarEnviosFiltroDto } from './dto/listar-envios-filtro.dto';
import { ListarMinhasEnvioVendaDto } from './dto/listar-minhas-envio-venda.dto';
import { RejeitarManualDto } from './dto/rejeitar-manual.dto';
export declare class EnvioVendaController {
    private readonly envioVendaService;
    constructor(envioVendaService: EnvioVendaService);
    criar(dto: CriarEnvioVendaDto, req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        criadoEm: Date;
        atualizadoEm: Date;
        campanhaId: string;
        requisitoId: string;
        numeroPedido: string;
        dataEnvio: Date;
        motivoRejeicao: string | null;
        infoConflito: string | null;
        numeroCartelaAtendida: number | null;
        dataValidacao: Date | null;
        vendedorId: string;
    }>;
    listar(req: any, filtros: ListarEnviosFiltroDto): Promise<({
        requisito: {
            id: string;
            descricao: string;
        };
        vendedor: {
            id: string;
            email: string;
            nome: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        criadoEm: Date;
        atualizadoEm: Date;
        campanhaId: string;
        requisitoId: string;
        numeroPedido: string;
        dataEnvio: Date;
        motivoRejeicao: string | null;
        infoConflito: string | null;
        numeroCartelaAtendida: number | null;
        dataValidacao: Date | null;
        vendedorId: string;
    })[]>;
    listarMinhas(req: any, query: ListarMinhasEnvioVendaDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        requisitoId: string;
        numeroPedido: string;
        dataEnvio: Date;
        motivoRejeicao: string;
        numeroCartelaAtendida: number;
        dataValidacao: Date;
    }[]>;
    validarManual(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        criadoEm: Date;
        atualizadoEm: Date;
        campanhaId: string;
        requisitoId: string;
        numeroPedido: string;
        dataEnvio: Date;
        motivoRejeicao: string | null;
        infoConflito: string | null;
        numeroCartelaAtendida: number | null;
        dataValidacao: Date | null;
        vendedorId: string;
    }>;
    rejeitarManual(id: string, dto: RejeitarManualDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        criadoEm: Date;
        atualizadoEm: Date;
        campanhaId: string;
        requisitoId: string;
        numeroPedido: string;
        dataEnvio: Date;
        motivoRejeicao: string | null;
        infoConflito: string | null;
        numeroCartelaAtendida: number | null;
        dataValidacao: Date | null;
        vendedorId: string;
    }>;
}
