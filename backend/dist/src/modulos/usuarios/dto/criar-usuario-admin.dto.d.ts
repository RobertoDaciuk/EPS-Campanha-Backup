import { PapelUsuario, StatusUsuario } from '@prisma/client';
export declare class CriarUsuarioAdminDto {
    email: string;
    nome: string;
    senha?: string;
    papel: PapelUsuario;
    cpf?: string;
    whatsapp?: string;
    status?: StatusUsuario;
    opticaId?: string;
    gerenteId?: string;
}
