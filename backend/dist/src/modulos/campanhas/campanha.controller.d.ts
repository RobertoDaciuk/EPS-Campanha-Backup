import { CampanhaService } from './campanha.service';
import { CriarCampanhaDto } from './dto/criar-campanha.dto';
import { AtualizarCampanhaDto } from './dto/atualizar-campanha.dto';
export declare class CampanhaController {
    private readonly campanhaService;
    private readonly logger;
    constructor(campanhaService: CampanhaService);
    listar(req: any): Promise<{
        id: string;
        titulo: string;
        descricao: string;
        dataInicio: Date;
        dataFim: Date;
        moedinhasPorCartela: number;
        pontosReaisPorCartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        percentualGerente: import("@prisma/client/runtime/library").Decimal;
        paraTodasOticas: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
    }[]>;
    criar(dto: CriarCampanhaDto): Promise<{
        id: string;
        titulo: string;
        descricao: string;
        dataInicio: Date;
        dataFim: Date;
        moedinhasPorCartela: number;
        pontosReaisPorCartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        percentualGerente: import("@prisma/client/runtime/library").Decimal;
        paraTodasOticas: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    buscarPorId(id: string, req: any): Promise<{
        oticasAlvo: {
            id: string;
            nome: string;
        }[];
        cartelas: ({
            requisitos: ({
                condicoes: {
                    id: string;
                    criadoEm: Date;
                    atualizadoEm: Date;
                    campo: import(".prisma/client").$Enums.CampoVerificacao;
                    operador: import(".prisma/client").$Enums.OperadorCondicao;
                    valor: string;
                    requisitoId: string;
                }[];
            } & {
                id: string;
                descricao: string;
                criadoEm: Date;
                atualizadoEm: Date;
                quantidade: number;
                tipoUnidade: import(".prisma/client").$Enums.TipoUnidade;
                ordem: number;
                regraCartelaId: string;
            })[];
        } & {
            id: string;
            descricao: string | null;
            criadoEm: Date;
            atualizadoEm: Date;
            numeroCartela: number;
            campanhaId: string;
        })[];
    } & {
        id: string;
        titulo: string;
        descricao: string;
        dataInicio: Date;
        dataFim: Date;
        moedinhasPorCartela: number;
        pontosReaisPorCartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        percentualGerente: import("@prisma/client/runtime/library").Decimal;
        paraTodasOticas: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    atualizar(id: string, dto: AtualizarCampanhaDto): Promise<{
        id: string;
        titulo: string;
        descricao: string;
        dataInicio: Date;
        dataFim: Date;
        moedinhasPorCartela: number;
        pontosReaisPorCartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        percentualGerente: import("@prisma/client/runtime/library").Decimal;
        paraTodasOticas: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    remover(id: string, req: any): Promise<{
        id: string;
        titulo: string;
        descricao: string;
        dataInicio: Date;
        dataFim: Date;
        moedinhasPorCartela: number;
        pontosReaisPorCartela: import("@prisma/client/runtime/library").Decimal;
        status: string;
        percentualGerente: import("@prisma/client/runtime/library").Decimal;
        paraTodasOticas: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
}
