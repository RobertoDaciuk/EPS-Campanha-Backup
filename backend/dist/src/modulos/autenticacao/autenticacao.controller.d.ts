import { AutenticacaoService } from './autenticacao.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { ResetarSenhaDto } from './dto/resetar-senha.dto';
export declare class AutenticacaoController {
    private readonly autenticacaoService;
    constructor(autenticacaoService: AutenticacaoService);
    registrar(dados: RegistrarUsuarioDto, req: any): Promise<{
        mensagem: string;
        usuario: {
            id: string;
            nome: string;
            email: string;
        };
    }>;
    login(dados: LoginDto, req: any): Promise<{
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
    resetarSenha(dados: ResetarSenhaDto, req: any): Promise<{
        mensagem: string;
    }>;
}
