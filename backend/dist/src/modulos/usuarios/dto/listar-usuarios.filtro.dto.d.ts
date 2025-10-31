import { PapelUsuario, StatusUsuario } from '@prisma/client';
export declare class ListarUsuariosFiltroDto {
    nomeOuEmail?: string;
    papel?: PapelUsuario;
    status?: StatusUsuario;
    opticaId?: string;
}
