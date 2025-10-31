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
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
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
    listar(usuario: {
        id: string;
        papel: string;
    }, filtros: ListarEnviosFiltroDto): Promise<({
        requisito: {
            id: string;
            descricao: string;
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
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
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
    listarMinhasPorCampanha(vendedorId: string, campanhaId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
        requisitoId: string;
        numeroPedido: string;
        dataEnvio: Date;
        motivoRejeicao: string;
        numeroCartelaAtendida: number;
        dataValidacao: Date;
    }[]>;
    validarManual(envioId: string): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
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
    rejeitarManual(envioId: string, dto: RejeitarManualDto): Promise<{
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        status: import(".prisma/client").$Enums.StatusEnvioVenda;
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
