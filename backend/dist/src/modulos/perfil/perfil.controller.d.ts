import { PerfilService } from './perfil.service';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
export declare class PerfilController {
    private readonly perfilService;
    constructor(perfilService: PerfilService);
    private getUsuarioId;
    meuPerfil(req: any): Promise<{
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
        mapeamentoPlanilhaSalvo: import("@prisma/client/runtime/library").JsonValue;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    atualizarMeuPerfil(req: any, dto: AtualizarPerfilDto): Promise<{
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
        mapeamentoPlanilhaSalvo: import("@prisma/client/runtime/library").JsonValue;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    atualizarMinhaSenha(req: any, dto: AtualizarSenhaDto): Promise<{
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
        mapeamentoPlanilhaSalvo: import("@prisma/client/runtime/library").JsonValue;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
}
