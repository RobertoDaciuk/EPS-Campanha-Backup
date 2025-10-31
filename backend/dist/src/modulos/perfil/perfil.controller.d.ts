import { PerfilService } from './perfil.service';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
export declare class PerfilController {
    private readonly perfilService;
    constructor(perfilService: PerfilService);
    private getUsuarioId;
    meuPerfil(req: any): Promise<{
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
        mapeamentoPlanilhaSalvo: import("@prisma/client/runtime/library").JsonValue;
    }>;
    atualizarMeuPerfil(req: any, dto: AtualizarPerfilDto): Promise<{
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
        mapeamentoPlanilhaSalvo: import("@prisma/client/runtime/library").JsonValue;
    }>;
    atualizarMinhaSenha(req: any, dto: AtualizarSenhaDto): Promise<{
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
        mapeamentoPlanilhaSalvo: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
