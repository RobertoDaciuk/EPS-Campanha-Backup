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
        numeroPedido: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        dataEnvio: Date;
        motivoRejeicao: string | null;
        infoConflito: string | null;
        numeroCartelaAtendida: number | null;
        dataValidacao: Date | null;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        campanhaId: string;
        requisitoId: string;
    }>;
    listar(req: any, filtros: ListarEnviosFiltroDto): Promise<({
        vendedor: {
            id: string;
            email: string;
            nome: string;
        };
        requisito: {
            id: string;
            descricao: string;
        };
    } & {
        id: string;
        numeroPedido: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        dataEnvio: Date;
        motivoRejeicao: string | null;
        infoConflito: string | null;
        numeroCartelaAtendida: number | null;
        dataValidacao: Date | null;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        campanhaId: string;
        requisitoId: string;
    })[]>;
    listarMinhas(req: any, query: ListarMinhasEnvioVendaDto): Promise<{
        id: string;
        numeroPedido: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        dataEnvio: Date;
        motivoRejeicao: string;
        numeroCartelaAtendida: number;
        dataValidacao: Date;
        requisitoId: string;
    }[]>;
    validarManual(id: string): Promise<{
        id: string;
        numeroPedido: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        dataEnvio: Date;
        motivoRejeicao: string | null;
        infoConflito: string | null;
        numeroCartelaAtendida: number | null;
        dataValidacao: Date | null;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        campanhaId: string;
        requisitoId: string;
    }>;
    rejeitarManual(id: string, dto: RejeitarManualDto): Promise<{
        id: string;
        numeroPedido: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        dataEnvio: Date;
        motivoRejeicao: string | null;
        infoConflito: string | null;
        numeroCartelaAtendida: number | null;
        dataValidacao: Date | null;
        criadoEm: Date;
        atualizadoEm: Date;
        vendedorId: string;
        campanhaId: string;
        requisitoId: string;
    }>;
}
