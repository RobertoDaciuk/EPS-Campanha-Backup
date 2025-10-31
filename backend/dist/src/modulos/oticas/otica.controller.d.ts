import { OticaService } from './otica.service';
import { CriarOticaDto } from './dto/criar-otica.dto';
import { AtualizarOticaDto } from './dto/atualizar-otica.dto';
import { ListarOticasFiltroDto } from './dto/listar-oticas.filtro.dto';
export declare class OticaController {
    private readonly oticaService;
    private readonly logger;
    constructor(oticaService: OticaService);
    verificarCnpj(cnpj: string): Promise<{
        id: string;
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        matrizId: string | null;
    }>;
    listarTudo(): Promise<{
        id: string;
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        matrizId: string | null;
    }[]>;
    buscarPorId(id: string): Promise<{
        id: string;
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        matrizId: string | null;
    }>;
    listarAdmin(filtros: ListarOticasFiltroDto): Promise<({
        matriz: {
            id: string;
            cnpj: string;
            nome: string;
        };
        filiais: {
            id: string;
            cnpj: string;
            nome: string;
        }[];
    } & {
        id: string;
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        matrizId: string | null;
    })[]>;
    criar(dto: CriarOticaDto): Promise<{
        matriz: {
            id: string;
            nome: string;
        };
    } & {
        id: string;
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        matrizId: string | null;
    }>;
    buscarPorIdAdmin(id: string): Promise<{
        matriz: {
            id: string;
            cnpj: string;
            nome: string;
        };
        filiais: {
            id: string;
            cnpj: string;
            nome: string;
        }[];
    } & {
        id: string;
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
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
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        matrizId: string | null;
    }>;
    desativar(id: string): Promise<{
        id: string;
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        matrizId: string | null;
    }>;
    reativar(id: string): Promise<{
        id: string;
        cnpj: string;
        nome: string;
        endereco: string | null;
        cidade: string | null;
        estado: string | null;
        telefone: string | null;
        email: string | null;
        ativa: boolean;
        ehMatriz: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        matrizId: string | null;
    }>;
}
