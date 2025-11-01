import { OticaService } from './otica.service';
import { CriarOticaDto } from './dto/criar-otica.dto';
import { AtualizarOticaDto } from './dto/atualizar-otica.dto';
import { ListarOticasFiltroDto } from './dto/listar-oticas.filtro.dto';
export declare class OticaController {
    private readonly oticaService;
    private readonly logger;
    constructor(oticaService: OticaService);
    verificarCnpj(cnpj: string): Promise<{
        nome: string;
        email: string | null;
        id: string;
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
    listarTudo(): Promise<{
        nome: string;
        email: string | null;
        id: string;
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
    }[]>;
    buscarPorId(id: string): Promise<{
        nome: string;
        email: string | null;
        id: string;
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
    listarAdmin(filtros: ListarOticasFiltroDto): Promise<({
        matriz: {
            nome: string;
            id: string;
            cnpj: string;
        };
        filiais: {
            nome: string;
            id: string;
            cnpj: string;
        }[];
    } & {
        nome: string;
        email: string | null;
        id: string;
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
    criar(dto: CriarOticaDto): Promise<{
        matriz: {
            nome: string;
            id: string;
        };
    } & {
        nome: string;
        email: string | null;
        id: string;
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
    buscarPorIdAdmin(id: string): Promise<{
        matriz: {
            nome: string;
            id: string;
            cnpj: string;
        };
        filiais: {
            nome: string;
            id: string;
            cnpj: string;
        }[];
    } & {
        nome: string;
        email: string | null;
        id: string;
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
            nome: string;
            id: string;
        };
        filiais: {
            nome: string;
            id: string;
        }[];
    } & {
        nome: string;
        email: string | null;
        id: string;
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
        nome: string;
        email: string | null;
        id: string;
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
        nome: string;
        email: string | null;
        id: string;
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
