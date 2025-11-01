import { PrismaService } from '../../prisma/prisma.service';
import { CriarCampanhaDto } from './dto/criar-campanha.dto';
import { AtualizarCampanhaDto } from './dto/atualizar-campanha.dto';
import { Campanha, Prisma, PapelUsuario } from '@prisma/client';
export declare class CampanhaService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    criar(dto: CriarCampanhaDto): Promise<Campanha>;
    listar(usuario: {
        id: string;
        papel: PapelUsuario;
        opticaId?: string | null;
    }): Promise<Campanha[]>;
    buscarPorId(id: string, usuario?: {
        id: string;
        papel: PapelUsuario;
        opticaId?: string | null;
    }): Promise<{
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
        pontosReaisPorCartela: Prisma.Decimal;
        status: string;
        percentualGerente: Prisma.Decimal;
        paraTodasOticas: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    atualizar(id: string, dto: AtualizarCampanhaDto): Promise<Campanha>;
    remover(id: string, usuario: {
        id: string;
        papel: PapelUsuario;
        opticaId?: string | null;
    }): Promise<Campanha>;
}
