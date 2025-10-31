import { PrismaService } from '../../prisma/prisma.service';
import { AutenticacaoService } from '../autenticacao/autenticacao.service';
import { CriarUsuarioAdminDto } from './dto/criar-usuario-admin.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { ListarUsuariosFiltroDto } from './dto/listar-usuarios.filtro.dto';
import { Usuario } from '@prisma/client';
export interface CriacaoUsuarioResposta {
    usuario: Usuario;
    tokenOriginal: string | null;
}
export declare class UsuarioService {
    private readonly prisma;
    private readonly autenticacaoService;
    private readonly logger;
    private readonly BCRYPT_SALT_ROUNDS;
    private readonly TOKEN_EXPIRACAO_MS;
    constructor(prisma: PrismaService, autenticacaoService: AutenticacaoService);
    private _limparCpf;
    private _limparWhatsApp;
    listar(filtros?: ListarUsuariosFiltroDto): Promise<Usuario[]>;
    buscarPorId(id: string): Promise<Usuario>;
    criarAdmin(dados: CriarUsuarioAdminDto): Promise<CriacaoUsuarioResposta>;
    atualizar(id: string, dados: AtualizarUsuarioDto): Promise<Usuario>;
    remover(id: string): Promise<Usuario>;
    aprovar(id: string): Promise<Usuario>;
    bloquear(id: string): Promise<Usuario>;
    desbloquear(id: string): Promise<Usuario>;
    personificar(idUsuarioAdmin: string, idUsuarioAlvo: string): Promise<string>;
    iniciarResetSenhaAdmin(idUsuario: string): Promise<{
        tokenOriginal: string;
    }>;
}
