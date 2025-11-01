import { PremioService } from './premio.service';
import { CriarPremioDto } from './dto/criar-premio.dto';
import { AtualizarPremioDto } from './dto/atualizar-premio.dto';
export declare class PremioController {
    private readonly premioService;
    constructor(premioService: PremioService);
    listar(): Promise<{
        nome: string;
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }[]>;
    buscarPorId(id: string): Promise<{
        nome: string;
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
    listarTodosAdmin(): Promise<{
        nome: string;
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }[]>;
    criar(dto: CriarPremioDto): Promise<{
        nome: string;
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
    atualizar(id: string, dto: AtualizarPremioDto): Promise<{
        nome: string;
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
    remover(id: string): Promise<{
        nome: string;
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
    uploadImagem(id: string, file: Express.Multer.File): Promise<{
        nome: string;
        id: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
}
