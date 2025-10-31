/**
 * ============================================================================
 * JWT AUTH GUARD - Guard de Autenticação JWT
 * ============================================================================
 * 
 * Descrição:
 * Guard que verifica se a requisição possui um token JWT válido no header
 * Authorization. Este é um "atalho" conveniente para usar o AuthGuard('jwt')
 * do Passport sem precisar importar e configurar em cada rota.
 * 
 * Uso:
 * ```
 * @UseGuards(JwtAuthGuard)
 * @Get('perfil')
 * obterPerfil(@Request() req) {
 *   return req.user; // Dados do usuário autenticado
 * }
 * ```
 * 
 * Fluxo:
 * 1. Extrai token do header Authorization: Bearer <token>
 * 2. Valida assinatura e expiração do token
 * 3. Decodifica payload e chama JwtStrategy.validate()
 * 4. Injeta dados do usuário em request.user
 * 5. Permite acesso à rota se válido, bloqueia se inválido
 * 
 * @module ComumModule
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de autenticação JWT.
 * 
 * Extende o AuthGuard do Passport com a estratégia 'jwt' configurada
 * no AutenticacaoModule (JwtStrategy).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
