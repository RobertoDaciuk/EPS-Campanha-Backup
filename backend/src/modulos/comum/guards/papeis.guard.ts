/**
 * ============================================================================
 * PAPEIS GUARD - Guard de Controle de Acesso Baseado em Papéis (RBAC)
 * ============================================================================
 *
 * Descrição:
 * Guard que implementa Role-Based Access Control (RBAC). Verifica se o
 * usuário autenticado possui um dos papéis necessários para acessar a rota.
 *
 * REFATORAÇÃO (Sprint 18.2 - Segurança Avançada):
 * - CORRIGIDO Vulnerabilidade #8: Validação explícita de request.user
 * - NOVO: Lança UnauthorizedException se usuário não autenticado
 * - NOVO: Mensagens de erro mais claras e específicas
 * - MELHORADO: Documentação TSDoc com cenários de erro
 *
 * Funciona em conjunto com:
 * - JwtAuthGuard: Autentica o usuário e injeta dados em request.user
 * - @Papeis(): Decorator que define papéis permitidos na rota
 *
 * Fluxo:
 * 1. JwtAuthGuard autentica e injeta request.user
 * 2. PapeisGuard lê metadata @Papeis da rota
 * 3. Verifica se request.user existe (se não, lança UnauthorizedException)
 * 4. Compara papel do usuário com papéis permitidos
 * 5. Permite acesso se houver match, bloqueia com 403 se não houver
 *
 * Cenários de Erro:
 * - 401 Unauthorized: Usuário não autenticado (request.user ausente)
 * - 403 Forbidden: Usuário autenticado mas sem papel necessário
 *
 * Uso:
 * ```
 * @UseGuards(JwtAuthGuard, PapeisGuard)
 * @Papeis('ADMIN', 'GERENTE')
 * @Get('relatorios')
 * obterRelatorios() {
 *   // Apenas ADMIN e GERENTE podem acessar
 * }
 * ```
 *
 * @module ComumModule
 * @see JwtAuthGuard Para autenticação JWT
 * @see Papeis Para decorator de definição de papéis
 * ============================================================================
 */

import { 
  Injectable, 
  CanActivate, 
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PAPEIS_CHAVE } from '../decorators/papeis.decorator';
import { PapelUsuario } from '@prisma/client';

/**
 * PapeisGuard - Guard de autorização baseado em papéis.
 * 
 * Implementa a interface CanActivate do NestJS para controlar acesso
 * a rotas com base no papel do usuário autenticado.
 * 
 * IMPORTANTE: Este Guard DEVE ser usado em conjunto com JwtAuthGuard,
 * pois depende de request.user injetado pela autenticação JWT.
 */
@Injectable()
export class PapeisGuard implements CanActivate {
  /**
   * Construtor do PapeisGuard.
   * 
   * @param reflector - Serviço do NestJS para ler metadata de rotas.
   *                    Usado para ler os papéis definidos via @Papeis().
   */
  constructor(private reflector: Reflector) {}

  /**
   * Método canActivate - Determina se a requisição pode acessar a rota.
   * 
   * Lógica:
   * 1. Extrai papéis necessários da metadata @Papeis()
   * 2. Se @Papeis() não definido: Permite acesso (rota não restrita)
   * 3. Extrai usuário de request.user (injetado por JwtAuthGuard)
   * 4. Valida se usuário existe (NOVO: Vulnerabilidade #8 corrigida)
   * 5. Compara papel do usuário com papéis permitidos
   * 6. Retorna true se match, lança ForbiddenException se não houver
   * 
   * @param context - Contexto de execução do NestJS (contém dados da requisição)
   * @returns boolean - true se acesso permitido
   * @throws UnauthorizedException - Se usuário não autenticado (request.user ausente)
   * @throws ForbiddenException - Se usuário autenticado mas sem papel necessário
   * 
   * @example
   * // Rota restrita a ADMIN e GERENTE
   * @UseGuards(JwtAuthGuard, PapeisGuard)
   * @Papeis('ADMIN', 'GERENTE')
   * @Get('relatorios')
   * obterRelatorios() {
   *   // Vendedor tentando acessar: 403 Forbidden
   *   // Admin ou Gerente: Acesso permitido
   * }
   * 
   * @example
   * // Rota sem @Papeis(): Apenas autenticação necessária
   * @UseGuards(JwtAuthGuard)
   * @Get('perfil')
   * obterPerfil() {
   *   // Qualquer usuário autenticado pode acessar
   * }
   * 
   * @example
   * // Cenário de erro: JwtAuthGuard falhou mas não lançou erro
   * @UseGuards(JwtAuthGuard, PapeisGuard)
   * @Papeis('ADMIN')
   * @Get('usuarios')
   * listarUsuarios() {
   *   // Se request.user ausente: 401 Unauthorized (CORRIGIDO)
   *   // Antes: 403 Forbidden (mensagem confusa)
   * }
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * Extrai papéis necessários da metadata @Papeis().
     * 
     * getAllAndOverride busca a metadata 'papeis' em:
     * 1. Método do controller (context.getHandler())
     * 2. Classe do controller (context.getClass())
     * 
     * Se encontrada em ambos, o valor do método tem prioridade.
     */
    const papeisNecessarios = this.reflector.getAllAndOverride<PapelUsuario[]>(
      PAPEIS_CHAVE,
      [context.getHandler(), context.getClass()],
    );

    /**
     * Se @Papeis() não foi definido na rota, permite acesso.
     * 
     * Isso significa que a rota requer apenas autenticação (JWT válido),
     * mas não restringe por papel específico.
     * 
     * Exemplo de rota sem @Papeis():
     * @Get('perfil')
     * obterPerfil() { ... } // Qualquer usuário autenticado pode acessar
     */
    if (!papeisNecessarios || papeisNecessarios.length === 0) {
      return true;
    }

    /**
     * Extrai usuário autenticado de request.user.
     * 
     * Este objeto foi injetado pelo JwtAuthGuard após validação JWT.
     * 
     * Estrutura esperada:
     * {
     *   id: 'uuid',
     *   email: 'usuario@example.com',
     *   papel: 'VENDEDOR' | 'GERENTE' | 'ADMIN'
     * }
     */
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    /**
     * CORRIGIDO (Vulnerabilidade #8):
     * Valida explicitamente se request.user existe.
     * 
     * ANTES: Usava optional chaining (user?.papel), que silenciosamente
     * retornava false (403 Forbidden) se user ausente.
     * 
     * AGORA: Lança UnauthorizedException (401) explicitamente se user ausente,
     * indicando claramente que o problema é falta de autenticação.
     * 
     * Cenário de bug detectado:
     * Se JwtAuthGuard falhar mas não lançar erro (bug de implementação),
     * request.user estará ausente. Antes, isso resultava em 403 Forbidden
     * (confuso, pois indica "não autorizado" ao invés de "não autenticado").
     * 
     * Agora, lançamos 401 Unauthorized, que é semanticamente correto.
     */
    if (!user) {
      throw new UnauthorizedException(
        'Usuário não autenticado. Token JWT ausente ou inválido.'
      );
    }

    /**
     * Compara papel do usuário com papéis permitidos.
     * 
     * Array.some() retorna true se pelo menos um elemento do array
     * satisfaz a condição (neste caso, se o papel do usuário está
     * na lista de papéis necessários).
     * 
     * Exemplo:
     * - papeisNecessarios = ['ADMIN', 'GERENTE']
     * - user.papel = 'GERENTE'
     * - Resultado: true (acesso permitido)
     * 
     * - user.papel = 'VENDEDOR'
     * - Resultado: false (lança ForbiddenException abaixo)
     */
    const temPapelNecessario = papeisNecessarios.some(
      (papel) => user.papel === papel
    );

    /**
     * Se usuário NÃO possui papel necessário, bloqueia acesso.
     * 
     * Lança ForbiddenException (403) com mensagem clara indicando:
     * - Qual papel o usuário possui
     * - Quais papéis são necessários para acessar a rota
     * 
     * IMPORTANTE: Mensagem de erro DEVE ser genérica em produção
     * para não vazar informações sobre a estrutura de papéis.
     * Em desenvolvimento, pode ser mais detalhada para debug.
     */
    if (!temPapelNecessario) {
      throw new ForbiddenException(
        `Acesso negado. Papel necessário: ${papeisNecessarios.join(' ou ')}. ` +
        `Você possui o papel: ${user.papel}.`
      );
    }

    /**
     * Se usuário possui papel necessário, permite acesso.
     */
    return true;
  }
}
