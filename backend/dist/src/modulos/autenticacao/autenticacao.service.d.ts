import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UsuarioService } from '../usuarios/usuario.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { ResetarSenhaDto } from './dto/resetar-senha.dto';
export declare class AutenticacaoService {
    private readonly prisma;
    private readonly jwtService;
    private readonly usuarioService;
    constructor(prisma: PrismaService, jwtService: JwtService, usuarioService: UsuarioService);
    registrar(dados: RegistrarUsuarioDto, req?: any): Promise<{
        mensagem: string;
        usuario: {
            id: string;
            nome: string;
            email: string;
        };
    }>;
    login(dados: LoginDto, req?: any): Promise<{
        token: string;
        usuario: {
            id: string;
            nome: string;
            email: string;
            papel: import(".prisma/client").$Enums.PapelUsuario;
            optica: {
                id: string;
                nome: string;
            };
        };
    }>;
    resetarSenha(dados: ResetarSenhaDto, req?: any): Promise<{
        mensagem: string;
    }>;
    gerarToken(payload: {
        id: string;
        email: string;
        papel: string;
    }): string;
    private _limparCpf;
    private _registrarlogAutenticacao;
}
