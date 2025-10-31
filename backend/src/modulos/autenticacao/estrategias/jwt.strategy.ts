/**
 * ============================================================================
 * JWT STRATEGY - Estratégia de Autenticação JWT com Passport
 * ============================================================================
 * 
 * Descrição:
 * Esta classe implementa a estratégia JWT do Passport.js para validar
 * tokens JWT em rotas protegidas. Ela extrai o token do header Authorization,
 * verifica a assinatura e decodifica o payload.
 * 
 * Como Funciona:
 * 1. Cliente envia requisição com header: Authorization: Bearer <token>
 * 2. ExtractJwt extrai o token do header
 * 3. Passport verifica a assinatura do token usando JWT_SECRET
 * 4. Se válido, o método validate() é chamado com o payload decodificado
 * 5. O retorno de validate() é injetado em request.user
 * 6. O controller pode acessar os dados do usuário via @Request()
 * 
 * Uso em Rotas Protegidas:
 * ```
 * @UseGuards(JwtAuthGuard)
 * @Get('perfil')
 * obterPerfil(@Request() req) {
 *   // req.user contém { id, email, papel }
 *   return req.user;
 * }
 * ```
 * 
 * @module AutenticacaoModule
 * ============================================================================
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Interface para o payload do JWT após decodificação.
 */
interface JwtPayload {
  sub: string; // ID do usuário
  email: string; // Email do usuário
  papel: string; // Papel do usuário
  iat?: number; // Issued At (timestamp de emissão)
  exp?: number; // Expiration (timestamp de expiração)
}

/**
 * Estratégia JWT para validação de tokens.
 * 
 * Estende PassportStrategy com a estratégia 'jwt' do passport-jwt.
 * Esta classe é registrada automaticamente pelo Passport quando o
 * módulo é inicializado.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Construtor da estratégia JWT.
   * 
   * Configura como o token será extraído e validado:
   * - jwtFromRequest: Extrai token do header Authorization (Bearer token)
   * - ignoreExpiration: false - Rejeita tokens expirados
   * - secretOrKey: Chave secreta para verificar assinatura (do .env)
   * 
   * @param configService - Serviço de configuração para ler JWT_SECRET
   */
  constructor(private readonly configService: ConfigService) {
    super({
      /**
       * Define como extrair o token JWT da requisição.
       * 
       * fromAuthHeaderAsBearerToken() extrai do header:
       * Authorization: Bearer <token>
       * 
       * Outras opções disponíveis:
       * - ExtractJwt.fromUrlQueryParameter('token')
       * - ExtractJwt.fromBodyField('token')
       * - ExtractJwt.fromHeader('x-api-key')
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * Define se tokens expirados devem ser aceitos.
       * 
       * false: Tokens expirados são rejeitados (RECOMENDADO)
       * true: Tokens expirados são aceitos (NÃO USE EM PRODUÇÃO)
       */
      ignoreExpiration: false,

      /**
       * Chave secreta usada para verificar a assinatura do token.
       * 
       * Deve ser a mesma usada para assinar o token no JwtService.
       * Lida do arquivo .env (variável JWT_SECRET).
       * 
       * IMPORTANTE: Use uma chave forte e mantenha em segredo!
       * Exemplo de geração: openssl rand -base64 64
       */
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Método de validação do payload do token JWT.
   * 
   * Este método é chamado automaticamente pelo Passport após verificar
   * a assinatura do token. Recebe o payload decodificado e pode fazer
   * validações adicionais (ex: verificar se usuário ainda existe no banco).
   * 
   * O retorno deste método é injetado automaticamente em request.user
   * em todas as rotas protegidas com @UseGuards(JwtAuthGuard).
   * 
   * Validações Opcionais (a implementar se necessário):
   * - Verificar se usuário ainda existe no banco
   * - Verificar se usuário não foi bloqueado desde emissão do token
   * - Verificar permissões específicas
   * 
   * @param payload - Payload decodificado do token JWT
   * @returns Dados do usuário que serão injetados em request.user
   * 
   * @throws {UnauthorizedException} Se validação falhar (opcional)
   * 
   * @example
   * Payload recebido:
   * ```
   * {
   *   "sub": "550e8400-e29b-41d4-a716-446655440000",
   *   "email": "joao@email.com",
   *   "papel": "VENDEDOR",
   *   "iat": 1698172800,
   *   "exp": 1698777600
   * }
   * ```
   * 
   * Objeto retornado (injetado em request.user):
   * ```
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "email": "joao@email.com",
   *   "papel": "VENDEDOR"
   * }
   * ```
   */
  async validate(payload: JwtPayload) {
    /**
     * Aqui você pode fazer validações adicionais, como:
     * 
     * 1. Verificar se o usuário ainda existe:
     * const usuario = await this.prisma.usuario.findUnique({
     *   where: { id: payload.sub }
     * });
     * if (!usuario) throw new UnauthorizedException('Usuário não encontrado');
     * 
     * 2. Verificar se o usuário não foi bloqueado:
     * if (usuario.status === 'BLOQUEADO') {
     *   throw new UnauthorizedException('Conta bloqueada');
     * }
     * 
     * Por enquanto, apenas retornamos o payload formatado.
     */

    return {
      id: payload.sub, // Renomeia 'sub' para 'id' para facilitar uso
      email: payload.email,
      papel: payload.papel,
    };
  }
}
