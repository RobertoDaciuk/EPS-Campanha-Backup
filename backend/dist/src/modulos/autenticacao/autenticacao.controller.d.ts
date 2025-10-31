import { AutenticacaoService, RespostaLogin } from './autenticacao.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { ResetarSenhaDto } from './dto/resetar-senha.dto';
export declare class AutenticacaoController {
    private readonly autenticacaoService;
    private readonly logger;
    constructor(autenticacaoService: AutenticacaoService);
    registrar(dados: RegistrarUsuarioDto): Promise<{
        message: string;
    }>;
    login(dados: LoginDto): Promise<RespostaLogin>;
    resetarSenha(dados: ResetarSenhaDto): Promise<{
        message: string;
    }>;
}
