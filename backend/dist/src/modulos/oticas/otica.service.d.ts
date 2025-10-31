import { PrismaService } from '../../prisma/prisma.service';
import { CriarOticaDto } from './dto/criar-otica.dto';
import { AtualizarOticaDto } from './dto/atualizar-otica.dto';
import { Optica } from '@prisma/client';
import { ListarOticasFiltroDto } from './dto/listar-oticas.filtro.dto';
export declare class OticaService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private _limparCnpj;
    private _validarHierarquia;
    listarTudo(): Promise<Optica[]>;
    buscarPorId(id: string): Promise<Optica>;
    buscarPorCnpjPublico(cnpj: string): Promise<{
        id: string;
        email: string | null;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cnpj: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        matrizId: string | null;
    }>;
    remover(id: string): Promise<Optica>;
    listarAdmin(filtros: ListarOticasFiltroDto): Promise<({
        matriz: {
            id: string;
            nome: string;
            cnpj: string;
        };
        filiais: {
            id: string;
            nome: string;
            cnpj: string;
        }[];
    } & {
        id: string;
        email: string | null;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cnpj: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        matrizId: string | null;
    })[]>;
    buscarPorIdAdmin(id: string): Promise<{
        matriz: {
            id: string;
            nome: string;
            cnpj: string;
        };
        filiais: {
            id: string;
            nome: string;
            cnpj: string;
        }[];
    } & {
        id: string;
        email: string | null;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cnpj: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        matrizId: string | null;
    }>;
    criar(dto: CriarOticaDto): Promise<{
        matriz: {
            id: string;
            nome: string;
        };
    } & {
        id: string;
        email: string | null;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cnpj: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        matrizId: string | null;
    }>;
    atualizar(id: string, dto: AtualizarOticaDto): Promise<{
        matriz: {
            id: string;
            nome: string;
        };
        filiais: {
            id: string;
            nome: string;
        }[];
    } & {
        id: string;
        email: string | null;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cnpj: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        matrizId: string | null;
    }>;
    desativar(id: string): Promise<{
        id: string;
        email: string | null;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cnpj: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        matrizId: string | null;
    }>;
    reativar(id: string): Promise<{
        id: string;
        email: string | null;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cnpj: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        matrizId: string | null;
    }>;
}
