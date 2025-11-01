import { PrismaService } from '../../prisma/prisma.service';
import { CriarEnvioVendaDto } from './dto/criar-envio-venda.dto';
import { ListarEnviosFiltroDto } from './dto/listar-envios-filtro.dto';
import { RejeitarManualDto } from './dto/rejeitar-manual.dto';
import { RecompensaService } from '../recompensa/recompensa.service';
export declare class EnvioVendaService {
    private readonly prisma;
    private readonly recompensaService;
    private readonly logger;
    constructor(prisma: PrismaService, recompensaService: RecompensaService);
    criar(dto: CriarEnvioVendaDto, vendedorId: string): Promise<{
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
    listar(usuario: {
        id: string;
        papel: string;
    }, filtros: ListarEnviosFiltroDto): Promise<({
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
    listarMinhasPorCampanha(vendedorId: string, campanhaId: string): Promise<{
        id: string;
        numeroPedido: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        dataEnvio: Date;
        motivoRejeicao: string;
        numeroCartelaAtendida: number;
        dataValidacao: Date;
        requisitoId: string;
    }[]>;
    validarManual(envioId: string): Promise<{
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
    rejeitarManual(envioId: string, dto: RejeitarManualDto): Promise<{
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
