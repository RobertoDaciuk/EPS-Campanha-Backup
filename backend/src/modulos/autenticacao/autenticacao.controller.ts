/**
 * ============================================================================
 * AUTENTICACAO CONTROLLER - Rotas HTTP de Autenticação
 * ============================================================================
 * 
 * Descrição:
 * Controlador responsável por expor endpoints HTTP para registro e login
 * de usuários. Todas as rotas deste controller são PÚBLICAS (não requerem
 * autenticação).
 * 
 * Base URL: /api/autenticacao
 * 
 * Rotas Públicas:
 * - POST /api/autenticacao/registrar
 *   Auto-registro de vendedor (cria usuário com status PENDENTE)
 * 
 * - POST /api/autenticacao/login
 *   Login de qualquer usuário (retorna token JWT se status ATIVO)
 * 
 * Segurança:
 * - Registro: Cria usuário com status PENDENTE (não pode logar até aprovação)
 * - Login: Valida status antes de gerar token (apenas ATIVO pode logar)
 * - Senhas: Sempre criptografadas com bcrypt antes de salvar
 * - Tokens: Assinados com JWT_SECRET, expiram conforme JWT_EXPIRES_IN
 * 
 * @module AutenticacaoModule
 * ============================================================================
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AutenticacaoService, RespostaLogin } from './autenticacao.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { ResetarSenhaDto } from './dto/resetar-senha.dto';

/**
 * Controlador de rotas de autenticação.
 * 
 * Prefixo de rota: /api/autenticacao
 */
@Controller('autenticacao')
export class AutenticacaoController {
  /**
   * Logger dedicado para rastrear requisições HTTP de autenticação.
   */
  private readonly logger = new Logger(AutenticacaoController.name);

  /**
   * Construtor do controlador.
   * 
   * @param autenticacaoService - Serviço de lógica de negócio de autenticação
   */
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  /**
   * Rota de auto-registro de vendedor.
   * 
   * Permite que um vendedor se cadastre na plataforma sem intervenção
   * do admin. O usuário é criado com status PENDENTE e só poderá fazer
   * login após um admin aprovar (alterar status para ATIVO).
   * 
   * Fluxo Completo (Jornada de João):
   * 1. Frontend: Vendedor verifica CNPJ da ótica (GET /api/oticas/verificar-cnpj/:cnpj)
   * 2. Frontend: Exibe formulário de registro com opticaId pré-preenchido
   * 3. Vendedor: Preenche nome, email, CPF, senha
   * 4. Frontend: Envia para esta rota (POST /api/autenticacao/registrar)
   * 5. Backend: Cria usuário com status PENDENTE
   * 6. Frontend: Exibe mensagem de sucesso e aguarda aprovação
   * 7. Admin: Aprova cadastro (altera status para ATIVO)
   * 8. Vendedor: Pode fazer login
   * 
   * Rota: POST /api/autenticacao/registrar
   * Acesso: Público (sem autenticação)
   * 
   * @param dados - Dados do vendedor (validados pelo DTO)
   * @returns Mensagem de sucesso (SEM token)
   * 
   * @throws {BadRequestException} Se CPF inválido
   * @throws {ConflictException} Se email ou CPF já cadastrado
   * 
   * @example
   * ```
   * POST /api/autenticacao/registrar
   * Content-Type: application/json
   * 
   * {
   *   "nome": "João da Silva",
   *   "email": "joao@email.com",
   *   "cpf": "123.456.789-00",
   *   "senha": "Senha@123",
   *   "opticaId": "550e8400-e29b-41d4-a716-446655440000"
   * }
   * ```
   * 
   * Resposta de Sucesso (201):
   * ```
   * {
   *   "message": "Cadastro enviado com sucesso! Sua conta será ativada após aprovação do administrador."
   * }
   * ```
   */
  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() dados: RegistrarUsuarioDto) {
    this.logger.log(`[PÚBLICO] Recebendo registro de: ${dados.email}`);

    const resultado = await this.autenticacaoService.registrar(dados);

    return resultado;
  }

  /**
   * Rota de login de usuário.
   * 
   * Autentica qualquer tipo de usuário (Admin, Gerente, Vendedor) e
   * retorna um token JWT que deve ser usado em requisições futuras.
   * 
   * Validações de Segurança:
   * - Email deve existir no banco
   * - Senha deve corresponder ao hash armazenado
   * - Status deve ser ATIVO (PENDENTE e BLOQUEADO não podem logar)
   * 
   * O token retornado deve ser armazenado pelo frontend (localStorage,
   * sessionStorage, cookie) e enviado no header de requisições futuras:
   * Authorization: Bearer <token>
   * 
   * Rota: POST /api/autenticacao/login
   * Acesso: Público (sem autenticação)
   * 
   * @param dados - Credenciais de login (validadas pelo DTO)
   * @returns Token JWT e dados básicos do usuário
   * 
   * @throws {NotFoundException} Se email não cadastrado
   * @throws {UnauthorizedException} Se senha inválida, PENDENTE ou BLOQUEADO
   * 
   * @example
   * ```
   * POST /api/autenticacao/login
   * Content-Type: application/json
   * 
   * {
   *   "email": "joao@email.com",
   *   "senha": "Senha@123"
   * }
   * ```
   * 
   * Resposta de Sucesso (200):
   * ```
   * {
   *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "usuario": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "nome": "João da Silva",
   *     "email": "joao@email.com",
   *     "papel": "VENDEDOR"
   *   }
   * }
   * ```
   * 
   * Resposta de Erro - PENDENTE (401):
   * ```
   * {
   *   "statusCode": 401,
   *   "message": "Sua conta está aguardando aprovação do administrador.",
   *   "error": "Unauthorized"
   * }
   * ```
   * 
   * Resposta de Erro - BLOQUEADO (401):
   * ```
   * {
   *   "statusCode": 401,
   *   "message": "Sua conta foi bloqueada.",
   *   "error": "Unauthorized"
   * }
   * ```
   */
  /**
   * Rota de login de usuário.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dados: LoginDto): Promise<RespostaLogin> {
    this.logger.log(`[PÚBLICO] Tentativa de login: ${dados.email}`);

    const resultado = await this.autenticacaoService.login(dados);

    return resultado;
  }

    /**
   * Reseta a senha de um usuário usando token (Público).
   * 
   * Rota pública onde o usuário fornece o token recebido do Admin
   * e define uma nova senha forte.
   * 
   * Rota: POST /api/autenticacao/resetar-senha
   * Acesso: Público (sem autenticação)
   * 
   * @param dados - Token e nova senha (validados pelo DTO)
   * @returns Mensagem de sucesso
   * 
   * @throws {BadRequestException} Se token inválido ou expirado
   * 
   * @example
   * ```
   * POST /api/autenticacao/resetar-senha
   * Content-Type: application/json
   * 
   * {
   *   "token": "a1b2c3d4e5f6789...64caracteres",
   *   "novaSenha": "NovaSenha@123"
   * }
   * ```
   * 
   * Resposta de Sucesso (200):
   * ```
   * {
   *   "message": "Senha alterada com sucesso! Você já pode fazer login com sua nova senha."
   * }
   * ```
   * 
   * Resposta de Erro - Token Inválido (400):
   * ```
   * {
   *   "statusCode": 400,
   *   "message": "Token de reset inválido ou já utilizado",
   *   "error": "Bad Request"
   * }
   * ```
   * 
   * Resposta de Erro - Token Expirado (400):
   * ```
   * {
   *   "statusCode": 400,
   *   "message": "Token de reset expirado. Solicite um novo token ao administrador.",
   *   "error": "Bad Request"
   * }
   * ```
   */
  @Post('resetar-senha')
  @HttpCode(HttpStatus.OK)
  async resetarSenha(@Body() dados: ResetarSenhaDto) {
    this.logger.log('[PÚBLICO] Processando reset de senha');

    const resultado = await this.autenticacaoService.resetarSenha(dados);

    return resultado;
  }

}
