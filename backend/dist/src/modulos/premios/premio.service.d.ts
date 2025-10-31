import { PrismaService } from '../../prisma/prisma.service';
import { CriarPremioDto } from './dto/criar-premio.dto';
import { AtualizarPremioDto } from './dto/atualizar-premio.dto';
import { ArmazenamentoService } from '../upload/armazenamento.service';
export declare class PremioService {
    private readonly prisma;
    private readonly armazenamentoService;
    constructor(prisma: PrismaService, armazenamentoService: ArmazenamentoService);
    criar(dto: CriarPremioDto): Promise<{
        id: string;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
    listar(): Promise<{
        id: string;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }[]>;
    listarTodosAdmin(): Promise<{
        id: string;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }[]>;
    buscarPorId(premioId: string): Promise<{
        id: string;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
    uploadImagem(premioId: string, file: Express.Multer.File): Promise<{
        id: string;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
    atualizar(id: string, dto: AtualizarPremioDto): Promise<{
        id: string;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
    remover(id: string): Promise<{
        id: string;
        nome: string;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string;
        imageUrl: string | null;
        custoMoedinhas: number;
        estoque: number;
        ativo: boolean;
    }>;
}
