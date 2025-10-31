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
                criadoEm: Date;
                atualizadoEm: Date;
                descricao: string;
                quantidade: number;
                tipoUnidade: import(".prisma/client").$Enums.TipoUnidade;
                ordem: number;
                regraCartelaId: string;
            })[];
        } & {
            id: string;
            criadoEm: Date;
            atualizadoEm: Date;
            descricao: string | null;
            numeroCartela: number;
            campanhaId: string;
        })[];
    } & {
        id: string;
        status: string;
        criadoEm: Date;
        atualizadoEm: Date;
        titulo: string;
        descricao: string;
        dataInicio: Date;
        dataFim: Date;
        moedinhasPorCartela: number;
        pontosReaisPorCartela: Prisma.Decimal;
        percentualGerente: Prisma.Decimal;
        paraTodasOticas: boolean;
    }>;
    atualizar(id: string, dto: AtualizarCampanhaDto): Promise<Campanha>;
    remover(id: string): Promise<Campanha>;
}
