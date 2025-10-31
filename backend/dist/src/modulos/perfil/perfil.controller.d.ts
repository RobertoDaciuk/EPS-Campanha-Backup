import { PerfilService } from './perfil.service';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
export declare class PerfilController {
    private readonly perfilService;
    constructor(perfilService: PerfilService);
    private getUsuarioId;
    meuPerfil(req: any): Promise<{
        id: string;
        email: string;
        cpf: string;
        nome: string;
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
        optica: {
            nome: string;
            cnpj: string;
        };
    }>;
    atualizarMeuPerfil(req: any, dto: AtualizarPerfilDto): Promise<{
        id: string;
        email: string;
        cpf: string;
        nome: string;
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
        id: string;
        email: string;
        cpf: string;
        nome: string;
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
