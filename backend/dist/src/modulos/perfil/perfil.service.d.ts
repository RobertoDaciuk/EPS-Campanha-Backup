import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
import { Prisma } from '@prisma/client';
export declare class PerfilService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    meuPerfil(usuarioId: string): Promise<{
        id: string;
        nome: string;
        email: string;
        criadoEm: Date;
        atualizadoEm: Date;
        optica: {
            cnpj: string;
            nome: string;
        };
        cpf: string;
        whatsapp: string;
        avatarUrl: string;
        papel: import(".prisma/client").$Enums.PapelUsuario;
        status: import(".prisma/client").$Enums.StatusUsuario;
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        mapeamentoPlanilhaSalvo: Prisma.JsonValue;
    }>;
    atualizarMeuPerfil(usuarioId: string, dto: AtualizarPerfilDto): Promise<{
        id: string;
        nome: string;
        email: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cpf: string;
        whatsapp: string;
        avatarUrl: string;
        papel: import(".prisma/client").$Enums.PapelUsuario;
        status: import(".prisma/client").$Enums.StatusUsuario;
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        mapeamentoPlanilhaSalvo: Prisma.JsonValue;
    }>;
    atualizarSenha(usuarioId: string, dto: AtualizarSenhaDto): Promise<{
        id: string;
        nome: string;
        email: string;
        criadoEm: Date;
        atualizadoEm: Date;
        cpf: string;
        whatsapp: string;
        avatarUrl: string;
        papel: import(".prisma/client").$Enums.PapelUsuario;
        status: import(".prisma/client").$Enums.StatusUsuario;
        saldoMoedinhas: number;
        rankingMoedinhas: number;
        nivel: import(".prisma/client").$Enums.NivelVendedor;
        mapeamentoPlanilhaSalvo: Prisma.JsonValue;
    }>;
}
