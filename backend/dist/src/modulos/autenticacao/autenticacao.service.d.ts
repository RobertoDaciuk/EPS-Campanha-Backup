import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { ResetarSenhaDto } from './dto/resetar-senha.dto';
export interface JwtPayload {
    sub: string;
    email: string;
    papel: string;
}
export interface RespostaLogin {
    accessToken: string;
    usuario: {
        id: string;
        nome: string;
        email: string;
        papel: string;
    };
}
export declare class AutenticacaoService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private readonly BCRYPT_SALT_ROUNDS;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    private _limparCpf;
    gerarToken(usuario: {
        id: string;
        email: string;
        papel: string;
        nome: string;
    }): RespostaLogin;
    registrar(dados: RegistrarUsuarioDto): Promise<{
        message: string;
    }>;
    login(dados: LoginDto): Promise<RespostaLogin>;
    resetarSenha(dados: ResetarSenhaDto): Promise<{
        message: string;
    }>;
}
