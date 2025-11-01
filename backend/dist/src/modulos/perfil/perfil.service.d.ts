import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
import { Prisma } from '@prisma/client';
export declare class PerfilService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    meuPerfil(usuarioId: string): Promise<{
        nome: string;
        email: string;
        cpf: string;
        optica: {
            nome: string;
            cnpj: string;
        };
        id: string;
        whatsapp: string;
        avatarUrl: string;
        papel: import(".prisma/client").$Enums.PapelUsuario;
        status: import(".prisma/client").$Enums.StatusUsuario;
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        mapeamentoPlanilhaSalvo: Prisma.JsonValue;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    atualizarMeuPerfil(usuarioId: string, dto: AtualizarPerfilDto): Promise<{
        nome: string;
        email: string;
        cpf: string;
        id: string;
        whatsapp: string;
        avatarUrl: string;
        papel: import(".prisma/client").$Enums.PapelUsuario;
        status: import(".prisma/client").$Enums.StatusUsuario;
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        mapeamentoPlanilhaSalvo: Prisma.JsonValue;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    atualizarSenha(usuarioId: string, dto: AtualizarSenhaDto): Promise<{
        nome: string;
        email: string;
        cpf: string;
        id: string;
        whatsapp: string;
        avatarUrl: string;
        papel: import(".prisma/client").$Enums.PapelUsuario;
        status: import(".prisma/client").$Enums.StatusUsuario;
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        mapeamentoPlanilhaSalvo: Prisma.JsonValue;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
}
