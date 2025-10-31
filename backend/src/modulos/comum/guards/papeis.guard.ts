/**
 * ============================================================================
 * PAPEIS GUARD - Guard de Controle de Acesso Baseado em Papéis (RBAC)
 * ============================================================================
 * 
 * Descrição:
 * Guard que implementa Role-Based Access Control (RBAC). Verifica se o
 * usuário autenticado possui um dos papéis necessários para acessar a rota.
 * 
 * Funciona em conjunto com:
 * - JwtAuthGuard: Autentica o usuário e injeta dados em request.user
 * - @Papeis(): Decorator que define papéis permitidos na rota
 * 
 * Fluxo:
 * 1. JwtAuthGuard autentica e injeta request.user
 * 2. PapeisGuard lê metadata @Papeis da rota
 * 3. Compara papel do usuário com papéis permitidos
 * 4. Permite acesso se houver match, bloqueia se não houver
 * 
 * @module ComumModule
 * ============================================================================
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PapelUsuario } from '@prisma/client';
import { PAPEIS_CHAVE } from '../decorators/papeis.decorator';

/**
 * Guard de validação de papéis.
 * 
 * Implementa CanActivate para decidir se uma requisição pode prosseguir
 * baseado no papel do usuário autenticado.
 */
@Injectable()
export class PapeisGuard implements CanActivate {
  /**
   * Construtor do guard.
   * 
   * @param reflector - Serviço do NestJS para ler metadata de decorators
   */
  constructor(private reflector: Reflector) {}

  /**
   * Método principal que decide se a requisição pode prosseguir.
   * 
   * @param context - Contexto de execução da requisição
   * @returns true se acesso permitido, false se bloqueado
   * 
   * @example
   * Fluxo de execução:
   * 
   * 1. Rota com @Papeis('ADMIN'):
   *    - Lê metadata: ['ADMIN']
   *    - Usuário tem papel 'ADMIN': permite (true)
   *    - Usuário tem papel 'VENDEDOR': bloqueia (false)
   * 
   * 2. Rota sem @Papeis:
   *    - Não há metadata de papéis
   *    - Permite acesso (rota pública ou apenas autenticada)
   * 
   * 3. Rota com @Papeis('ADMIN', 'GERENTE'):
   *    - Lê metadata: ['ADMIN', 'GERENTE']
   *    - Usuário tem papel 'ADMIN': permite (true)
   *    - Usuário tem papel 'GERENTE': permite (true)
   *    - Usuário tem papel 'VENDEDOR': bloqueia (false)
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * Obtém os papéis necessários da metadata da rota.
     * 
     * getAllAndOverride busca metadata em dois níveis:
     * 1. No método do controller (handler) - prioridade
     * 2. Na classe do controller - fallback
     * 
     * Isso permite definir @Papeis tanto no método quanto na classe:
     * 
     * @Papeis('ADMIN') // Aplica a toda a classe
     * @Controller('usuarios')
     * class UsuarioController {
     *   @Get() // Herda 'ADMIN' da classe
     *   listar() {}
     * 
     *   @Papeis('ADMIN', 'GERENTE') // Sobrescreve para este método
     *   @Get(':id')
     *   buscarPorId() {}
     * }
     */
    const papeisNecessarios = this.reflector.getAllAndOverride<PapelUsuario[]>(
      PAPEIS_CHAVE,
      [
        context.getHandler(), // Metadata do método
        context.getClass(),   // Metadata da classe
      ],
    );

    /**
     * Se não há papéis definidos, permite acesso.
     * 
     * Isso significa que a rota não tem restrição de papel específico.
     * Útil para rotas que apenas requerem autenticação (JwtAuthGuard)
     * mas não importam o papel do usuário.
     */
    if (!papeisNecessarios) {
      return true;
    }

    /**
     * Obtém os dados do usuário autenticado da requisição.
     * 
     * O JwtAuthGuard (que deve ser executado ANTES deste guard)
     * já validou o token e injetou os dados do usuário em request.user.
     * 
     * Estrutura esperada de request.user:
     * {
     *   id: string,
     *   email: string,
     *   papel: 'ADMIN' | 'GERENTE' | 'VENDEDOR'
     * }
     */
    const { user } = context.switchToHttp().getRequest();

    /**
     * Verifica se o papel do usuário está na lista de papéis permitidos.
     * 
     * some() retorna true se pelo menos um elemento do array satisfaz a condição.
     * 
     * Exemplos:
     * - papeisNecessarios: ['ADMIN']
     *   user.papel: 'ADMIN' → retorna true (permite)
     * 
     * - papeisNecessarios: ['ADMIN', 'GERENTE']
     *   user.papel: 'GERENTE' → retorna true (permite)
     * 
     * - papeisNecessarios: ['ADMIN']
     *   user.papel: 'VENDEDOR' → retorna false (bloqueia, 403)
     */
    return papeisNecessarios.some((papel) => user?.papel === papel);
  }
}
