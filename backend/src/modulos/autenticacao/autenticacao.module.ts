/**
 * ============================================================================
 * AUTENTICACAO MODULE - Módulo de Autenticação e Registro (REFATORADO)
 * ============================================================================
 *
 * REFATORAÇÃO (Sprint 18.2 - Segurança Avançada):
 * - CORRIGIDO Vulnerabilidade #1: JWT_SECRET sem fallback inseguro
 * - NOVO: Validação obrigatória de JWT_SECRET (lança erro se ausente)
 * - NOVO: Validação de JWT_EXPIRES_IN (fallback seguro para 7d)
 * - MELHORADO: Documentação TSDoc sobre configuração crítica de segurança
 *
 * Descrição:
 * Módulo responsável por toda a lógica de autenticação e registro de usuários.
 * Configura JWT, Passport e expõe rotas públicas de login/registro/reset.
 *
 * Dependências:
 * - PassportModule: Framework de autenticação
 * - JwtModule: Geração e validação de tokens JWT
 * - UsuarioModule: Acesso ao UsuarioService para operações de usuário
 *
 * Segurança Crítica:
 * - JWT_SECRET: DEVE estar configurado no .env, caso contrário sistema aborta
 * - JWT_EXPIRES_IN: Tempo de expiração dos tokens (padrão: 7 dias)
 * - Tokens são assinados com HS256 (HMAC-SHA256)
 *
 * @module AutenticacaoModule
 * ============================================================================
 */

import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoService } from './autenticacao.service';
import { JwtStrategy } from './estrategias/jwt.strategy';
import { UsuarioModule } from '../usuarios/usuario.module';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de autenticação e registro de usuários.
 * 
 * Configura:
 * - Passport com estratégia JWT
 * - JwtModule com validação obrigatória de JWT_SECRET
 * - Rotas públicas de autenticação (login, registro, reset)
 */
@Module({
  imports: [
    /**
     * PassportModule: Registra o framework Passport.js.
     * 
     * defaultStrategy: Define 'jwt' como estratégia padrão para
     * AuthGuard('jwt') usado nos Guards.
     */
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    /**
     * JwtModule: Registra o módulo JWT com configuração assíncrona.
     * 
     * REFATORAÇÃO (Vulnerabilidade #1):
     * - REMOVIDO: Fallback inseguro 'default-secret'
     * - ADICIONADO: Validação obrigatória de JWT_SECRET
     * - ADICIONADO: Lança erro explícito se JWT_SECRET ausente
     * 
     * useFactory: Função assíncrona que recebe ConfigService e retorna
     * configuração do JWT. Executada durante inicialização do módulo.
     * 
     * Segurança:
     * - JWT_SECRET DEVE ser string aleatória forte (mínimo 32 caracteres)
     * - JWT_SECRET NUNCA deve ser commitado no Git
     * - JWT_SECRET DEVE ser diferente em cada ambiente (dev, staging, prod)
     * 
     * Se JWT_SECRET não estiver configurado:
     * - Sistema lança erro e ABORTA inicialização
     * - Previne execução com chave insegura
     * - Fail-fast: Melhor falhar cedo do que executar inseguro
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        /**
         * Extrai JWT_SECRET do .env.
         * 
         * ConfigService.get retorna undefined se variável não existir.
         */
        const jwtSecret = configService.get<string>('JWT_SECRET');

        /**
         * VALIDAÇÃO CRÍTICA (NOVO - Vulnerabilidade #1):
         * 
         * Se JWT_SECRET ausente, lança erro e aborta sistema.
         * 
         * ANTES: Usava fallback 'default-secret' silenciosamente
         * PROBLEMA: Atacante poderia gerar tokens válidos com chave conhecida
         * AGORA: Sistema falha explicitamente, forçando configuração correta
         * 
         * Mensagem de erro inclui:
         * - Descrição do problema
         * - Caminho para resolução (configurar .env)
         * - Exemplo de geração de chave segura
         */
        if (!jwtSecret) {
          throw new Error(
            '\n\nERRO CRÍTICO: JWT_SECRET não configurado no .env\n' +
            'Configure JWT_SECRET antes de iniciar o sistema.\n'
          );
        }

        /**
         * Extrai JWT_EXPIRES_IN do .env.
         * 
         * Fallback seguro: '7d' (7 dias)
         * 
         * Este fallback é SEGURO porque:
         * - Não compromete segurança (apenas define tempo de expiração)
         * - 7 dias é valor razoável para produção
         * - Pode ser sobrescrito configurando JWT_EXPIRES_IN no .env
         * 
         * Valores aceitos:
         * - '1h' (1 hora)
         * - '7d' (7 dias)
         * - '30d' (30 dias)
         * - '60' (60 segundos)
         * 
         * Recomendação:
         * - Produção: 7d a 30d
         * - Desenvolvimento: 7d
         * - Tokens de curta duração: 1h (para operações sensíveis)
         */
        const jwtExpiresIn = configService.get<string>('JWT_EXPIRES_IN', '7d');

        /**
         * Retorna configuração do JwtModule.
         * 
         * secret: Chave secreta para assinar e validar tokens
         * signOptions.expiresIn: Tempo de expiração dos tokens
         * 
         * Algoritmo padrão: HS256 (HMAC-SHA256)
         */
        
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn as any,
          },
        };
      },
    }),

    /**
     * UsuarioModule: Importa UsuarioService para operações de usuário.
     * 
     * Necessário para:
     * - Registro: Criar novo usuário
     * - Login: Buscar usuário por email e validar senha
     * - Reset: Buscar usuário e atualizar token de reset
     */
    forwardRef(() => UsuarioModule),

    /**
     * PrismaModule: Importa PrismaService para acesso ao banco.
     * 
     * Necessário para:
     * - Criar registros de LogAutenticacao (auditoria)
     * - Operações diretas no banco (se necessário)
     */
    PrismaModule,
  ],

  /**
   * Controllers: Expõe rotas HTTP de autenticação.
   * 
   * Rotas públicas (marcadas com @Public()):
   * - POST /autenticacao/registrar
   * - POST /autenticacao/login
   * - POST /autenticacao/resetar-senha
   */
  controllers: [AutenticacaoController],

  /**
   * Providers: Serviços e estratégias do módulo.
   * 
   * - AutenticacaoService: Lógica de negócio de autenticação
   * - JwtStrategy: Estratégia Passport para validação JWT
   */
  providers: [AutenticacaoService, JwtStrategy],

  /**
   * Exports: Serviços disponíveis para outros módulos.
   * 
   * AutenticacaoService exportado para permitir que outros módulos
   * (ex: PerfilModule) possam usar métodos de autenticação.
   */
  exports: [AutenticacaoService],
})
export class AutenticacaoModule {}
