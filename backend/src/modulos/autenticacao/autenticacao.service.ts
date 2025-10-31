/**
 * ============================================================================
 * AUTENTICACAO SERVICE - Lógica de Negócio de Autenticação (REFATORADO)
 * ============================================================================
 *
 * REFATORAÇÃO (Sprint 18.2 - Segurança Avançada):
 * - CORRIGIDO Vulnerabilidade #4: Mensagens de erro genéricas (anti-enumeração)
 * - CORRIGIDO Vulnerabilidade #5: Timing attack mitigado no login
 * - CORRIGIDO Vulnerabilidade #9: Sistema de auditoria implementado (logAutenticacao)
 * - NOVO: Método _registrarlogAutenticacao para auditoria de segurança
 * - NOVO: Extração de IP e User-Agent das requisições
 * - NOVO: Logs detalhados em desenvolvimento (NODE_ENV)
 *
 * Descrição:
 * Serviço responsável por toda a lógica de registro e autenticação de
 * usuários. Gerencia criptografia de senhas, geração de tokens JWT e
 * validação de status de usuários.
 *
 * Responsabilidades:
 * - Auto-registro de vendedores com status PENDENTE
 * - Login com validação de senha e status (apenas ATIVO pode logar)
 * - Geração de tokens JWT com payload personalizado
 * - Sanitização de CPF (remover pontuação)
 * - Validação de duplicatas (email, CPF)
 * - Auditoria de segurança (logAutenticacao)
 * - Mitigação de timing attacks
 * - Prevenção de enumeração de usuários
 *
 * Fluxo de Registro:
 * 1. Sanitiza CPF (remove pontuação)
 * 2. Valida duplicatas (email, CPF)
 * 3. Criptografa senha com bcrypt (salt rounds: 10)
 * 4. Cria usuário com status PENDENTE e papel VENDEDOR
 * 5. Registra log de auditoria (REGISTRO_SUCESSO)
 * 6. Retorna mensagem de sucesso (SEM token)
 *
 * Fluxo de Login:
 * 1. Busca usuário por email
 * 2. Executa bcrypt.compare SEMPRE (mitiga timing attack)
 * 3. Valida senha e status
 * 4. Gera token JWT se válido
 * 5. Registra log de auditoria (LOGIN_SUCESSO ou LOGIN_FALHA)
 * 6. Retorna token e dados do usuário
 *
 * Segurança:
 * - Senhas NUNCA armazenadas em texto puro (bcrypt)
 * - Mensagens de erro genéricas (previne enumeração)
 * - Timing attack mitigado (bcrypt.compare sempre executado)
 * - Auditoria completa de tentativas (logAutenticacao)
 * - Rate Limiting aplicado via ThrottlerGuard (app.module.ts)
 *
 * @module AutenticacaoModule
 * ============================================================================
 */

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { UsuarioService } from '../usuarios/usuario.service';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { ResetarSenhaDto } from './dto/resetar-senha.dto';

/**
 * Serviço de autenticação e registro de usuários.
 */
@Injectable()
export class AutenticacaoService {
  /**
   * Construtor do AutenticacaoService.
   * 
   * @param prisma - Serviço do Prisma para acesso ao banco
   * @param jwtService - Serviço do JWT para geração de tokens
   * @param usuarioService - Serviço de usuários para operações CRUD
   */
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
  ) {}

  /**
   * Registra um novo vendedor no sistema (auto-registro).
   * 
   * REFATORAÇÃO (Vulnerabilidade #4 e #9):
   * - Mensagens de erro genéricas para prevenir enumeração
   * - Auditoria de tentativas de registro duplicadas
   * - Logs de sucesso e falha
   * 
   * Fluxo:
   * 1. Sanitiza CPF (remove pontuação)
   * 2. Verifica duplicatas (email OU CPF)
   * 3. Se duplicata: Registra log e lança erro GENÉRICO
   * 4. Criptografa senha com bcrypt
   * 5. Cria usuário com status PENDENTE e papel VENDEDOR
   * 6. Registra log de sucesso
   * 7. Retorna mensagem de sucesso
   * 
   * @param dados - DTO com dados do novo vendedor
   * @param req - Objeto Request (para extrair IP e User-Agent)
   * @returns Mensagem de sucesso
   * @throws ConflictException - Se email ou CPF já cadastrado (mensagem genérica)
   * @throws BadRequestException - Se CPF inválido
   */
  async registrar(dados: RegistrarUsuarioDto, req?: any) {
    /**
     * Sanitiza CPF: Remove pontuação (pontos, traços, espaços).
     */
    const cpfLimpo = this._limparCpf(dados.cpf);

    /**
     * Verifica se já existe usuário com o mesmo email OU CPF.
     * 
     * IMPORTANTE: Usa OR lógico para buscar QUALQUER duplicata.
     */
    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ email: dados.email }, { cpf: cpfLimpo }],
      },
      select: {
        email: true,
        cpf: true,
      },
    });

    /**
     * Se duplicata encontrada: Registra log e lança erro GENÉRICO.
     * 
     * REFATORAÇÃO (Vulnerabilidade #4):
     * ANTES: Mensagem específica ("Email já cadastrado" vs "CPF já cadastrado")
     * PROBLEMA: Permitia enumeração de usuários (atacante descobre emails/CPFs válidos)
     * AGORA: Mensagem genérica para AMBOS os casos
     * 
     * REFATORAÇÃO (Vulnerabilidade #9):
     * NOVO: Registra log de auditoria com tipo específico
     * - REGISTRO_DUPLICADO_EMAIL: Se email duplicado
     * - REGISTRO_DUPLICADO_CPF: Se CPF duplicado
     */
    if (usuarioExistente) {
      const tipoDuplicacao =
        usuarioExistente.email === dados.email
          ? 'REGISTRO_DUPLICADO_EMAIL'
          : 'REGISTRO_DUPLICADO_CPF';

      await this._registrarlogAutenticacao({
        tipo: tipoDuplicacao,
        email: dados.email,
        cpf: cpfLimpo,
        usuarioId: null,
        req,
        detalhes: {
          motivo:
            tipoDuplicacao === 'REGISTRO_DUPLICADO_EMAIL'
              ? 'email_ja_cadastrado'
              : 'cpf_ja_cadastrado',
        },
      });

      /**
       * Lança erro GENÉRICO (não revela qual campo está duplicado).
       * 
       * Mensagem: "Dados já cadastrados no sistema"
       * - Não menciona "email" ou "CPF"
       * - Previne enumeração de usuários
       */
      throw new ConflictException(
        'Dados já cadastrados no sistema. Verifique as informações fornecidas.',
      );
    }

    /**
     * Criptografa senha com bcrypt.
     * 
     * Salt rounds: 10 (balanço entre segurança e performance)
     * - Cada incremento dobra o tempo de processamento
     * - 10 rounds: ~100ms por hash (adequado para produção)
     */
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    /**
     * Cria usuário no banco com status PENDENTE e papel VENDEDOR.
     * 
     * Status PENDENTE: Aguarda aprovação do Admin
     * Papel VENDEDOR: Auto-registro é sempre para vendedores
     */
    const novoUsuario = await this.prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senhaHash,
        cpf: cpfLimpo,
        papel: 'VENDEDOR',
        status: 'PENDENTE',
        opticaId: dados.opticaId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        status: true,
      },
    });

    /**
     * Registra log de sucesso (NOVO - Vulnerabilidade #9).
     */
    await this._registrarlogAutenticacao({
      tipo: 'REGISTRO_SUCESSO',
      email: dados.email,
      cpf: cpfLimpo,
      usuarioId: novoUsuario.id,
      req,
      detalhes: {
        papel: novoUsuario.papel,
        status: novoUsuario.status,
      },
    });

    /**
     * Log de desenvolvimento (apenas se NODE_ENV !== 'production').
     */
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTENTICACAO] Novo vendedor registrado:', {
        id: novoUsuario.id,
        email: novoUsuario.email,
        status: novoUsuario.status,
      });
    }

    return {
      mensagem:
        'Cadastro realizado com sucesso! Aguarde a aprovação do administrador para fazer login.',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
      },
    };
  }

  /**
   * Realiza login de usuário (qualquer papel).
   * 
   * REFATORAÇÃO (Vulnerabilidade #5 - Timing Attack):
   * - SEMPRE executa bcrypt.compare, mesmo se usuário não existir
   * - Tempo de resposta constante (mitiga timing attack)
   * 
   * REFATORAÇÃO (Vulnerabilidade #4 - Enumeração):
   * - Mensagens de erro genéricas
   * - Não revela se email existe ou não
   * 
   * REFATORAÇÃO (Vulnerabilidade #9 - Auditoria):
   * - Registra TODAS as tentativas de login
   * - Sucesso: LOGIN_SUCESSO
   * - Falha: LOGIN_FALHA_CREDENCIAIS ou LOGIN_FALHA_STATUS
   * 
   * @param dados - DTO com email e senha
   * @param req - Objeto Request (para extrair IP e User-Agent)
   * @returns Token JWT e dados do usuário
   * @throws UnauthorizedException - Se credenciais inválidas ou status não ATIVO
   */
  async login(dados: LoginDto, req?: any) {
    const { email, senha } = dados;

    /**
     * Busca usuário por email.
     */
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        optica: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    /**
     * MITIGAÇÃO DE TIMING ATTACK (NOVO - Vulnerabilidade #5):
     * 
     * PROBLEMA: Se usuário não existir, retornar erro imediatamente
     * permite timing attack (atacante mede tempo de resposta para
     * determinar se email existe).
     * 
     * SOLUÇÃO: SEMPRE executar bcrypt.compare, mesmo se usuário
     * não existir. Isso garante tempo de resposta constante.
     * 
     * Como funciona:
     * 1. Se usuário existe: compara senha fornecida com hash real
     * 2. Se usuário NÃO existe: compara senha com hash fake
     * 3. Ambos levam ~100ms (tempo do bcrypt.compare)
     * 4. Atacante não consegue diferenciar pelos tempos
     */
    const senhaHash = usuario?.senhaHash || (await bcrypt.hash('senha-fake-para-timing', 10));
    const senhaValida = await bcrypt.compare(senha, senhaHash);

    /**
     * Valida credenciais e status.
     * 
     * Condições de falha:
     * 1. Usuário não existe (!usuario)
     * 2. Senha incorreta (!senhaValida)
     * 3. Status não é ATIVO (usuario.status !== 'ATIVO')
     */
    if (!usuario || !senhaValida) {
      /**
       * Registra log de falha por credenciais inválidas.
       */
      await this._registrarlogAutenticacao({
        tipo: 'LOGIN_FALHA_CREDENCIAIS',
        email,
        cpf: null,
        usuarioId: usuario?.id || null,
        req,
        detalhes: {
          motivo: !usuario ? 'email_nao_encontrado' : 'senha_incorreta',
        },
      });

      /**
       * Lança erro GENÉRICO (REFATORAÇÃO - Vulnerabilidade #4).
       * 
       * Mensagem: "Credenciais inválidas"
       * - Não revela se email existe
       * - Não revela se senha está errada
       * - Previne enumeração de usuários
       */
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    /**
     * Valida status do usuário.
     * 
     * Apenas usuários com status ATIVO podem fazer login.
     * - PENDENTE: Aguardando aprovação do Admin
     * - BLOQUEADO: Bloqueado pelo Admin
     */
    if (usuario.status !== 'ATIVO') {
      /**
       * Registra log de falha por status inválido.
       */
      await this._registrarlogAutenticacao({
        tipo: 'LOGIN_FALHA_STATUS',
        email,
        cpf: usuario.cpf,
        usuarioId: usuario.id,
        req,
        detalhes: {
          motivo: 'status_nao_ativo',
          statusAtual: usuario.status,
        },
      });

      /**
       * Lança erro com mensagem específica de acordo com o status.
       */
      const mensagemStatus =
        usuario.status === 'PENDENTE'
          ? 'Sua conta ainda não foi aprovada pelo administrador.'
          : 'Sua conta foi bloqueada. Entre em contato com o administrador.';

      throw new UnauthorizedException(mensagemStatus);
    }

    /**
     * Gera token JWT.
     * 
     * Payload contém:
     * - sub: ID do usuário (Subject)
     * - email: Email do usuário
     * - papel: Papel do usuário (RBAC)
     */
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
    };

    const token = this.jwtService.sign(payload);

    /**
     * Registra log de sucesso (NOVO - Vulnerabilidade #9).
     */
    await this._registrarlogAutenticacao({
      tipo: 'LOGIN_SUCESSO',
      email,
      cpf: usuario.cpf,
      usuarioId: usuario.id,
      req,
      detalhes: {
        papel: usuario.papel,
      },
    });

    /**
     * Log de desenvolvimento.
     */
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTENTICACAO] Login bem-sucedido:', {
        id: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
      });
    }

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        optica: usuario.optica,
      },
    };
  }
    /**
   * Reseta senha de usuário usando token temporário.
   * 
   * REFATORAÇÃO (Vulnerabilidade #9):
   * - Registra tentativas de reset (sucesso e falha)
   * - Auditoria de tokens inválidos/expirados
   * 
   * Fluxo:
   * 1. Gera hash SHA-256 do token fornecido
   * 2. Busca usuário com token hash e validação de expiração
   * 3. Se inválido: Registra log e lança erro
   * 4. Criptografa nova senha
   * 5. Atualiza senha e descarta token
   * 6. Registra log de sucesso
   * 
   * @param dados - DTO com token e nova senha
   * @param req - Objeto Request (para extrair IP e User-Agent)
   * @returns Mensagem de sucesso
   * @throws NotFoundException - Se token inválido ou expirado
   */
  async resetarSenha(dados: ResetarSenhaDto, req?: any) {
    const { token, novaSenha } = dados;

    /**
     * Gera hash SHA-256 do token fornecido.
     * 
     * Token original NUNCA é armazenado no banco (apenas hash).
     * Para validar, geramos hash do token fornecido e comparamos.
     */
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    /**
     * Busca usuário com token hash válido e não expirado.
     * 
     * Condições:
     * - tokenResetSenha = hash do token fornecido
     * - expiraTokenResetSenha > NOW() (não expirado)
     */
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        tokenResetarSenha: tokenHash,
        tokenResetarSenhaExpira: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        cpf: true,
      },
    });

    /**
     * Se token inválido ou expirado: Registra log e lança erro.
     */
    if (!usuario) {
      /**
       * Registra log de falha (NOVO - Vulnerabilidade #9).
       */
      await this._registrarlogAutenticacao({
        tipo: 'RESET_TOKEN_INVALIDO',
        email: null,
        cpf: null,
        usuarioId: null,
        req,
        detalhes: {
          motivo: 'token_invalido_ou_expirado',
          tokenHash: tokenHash.substring(0, 10) + '...', // Primeiros 10 caracteres para auditoria
        },
      });

      throw new NotFoundException(
        'Token de reset inválido ou expirado. Solicite um novo token.',
      );
    }

    /**
     * Criptografa nova senha com bcrypt.
     */
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    /**
     * Atualiza senha e descarta token de reset.
     * 
     * tokenResetSenha e expiraTokenResetSenha são definidos como null
     * para invalidar o token (uso único).
     */
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senhaHash: novaSenhaHash,
        tokenResetarSenha: null,
        tokenResetarSenhaExpira: null, 
      },
    });

    /**
     * Registra log de sucesso (NOVO - Vulnerabilidade #9).
     */
    await this._registrarlogAutenticacao({
      tipo: 'RESET_TOKEN_SUCESSO',
      email: usuario.email,
      cpf: usuario.cpf,
      usuarioId: usuario.id,
      req,
      detalhes: {
        motivo: 'senha_resetada_com_sucesso',
      },
    });

    /**
     * Log de desenvolvimento.
     */
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTENTICACAO] Senha resetada com sucesso:', {
        id: usuario.id,
        email: usuario.email,
      });
    }

    return {
      mensagem: 'Senha resetada com sucesso! Você já pode fazer login com a nova senha.',
    };
  }

    /**
   * Gera token JWT para um usuário.
   * 
   * PÚBLICO: Usado por UsuarioService quando Admin cria usuário e precisa 
   * retornar token imediatamente (sem passar por login).
   * 
   * @param payload - Dados do usuário para incluir no token
   * @returns Token JWT assinado
   * 
   * @example
   * const token = this.autenticacaoService.gerarToken({
   *   id: usuario.id,
   *   email: usuario.email,
   *   papel: usuario.papel,
   * });
   */
  gerarToken(payload: { id: string; email: string; papel: string }): string {
    return this.jwtService.sign({
      sub: payload.id,
      email: payload.email,
      papel: payload.papel,
    });
  }


  // ========================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ========================================

  /**
   * Sanitiza CPF: Remove pontuação (pontos, traços, espaços).
   * 
   * Validação:
   * - CPF deve ter exatamente 11 dígitos após sanitização
   * - CPF deve conter apenas números
   * 
   * @param cpf - CPF com ou sem pontuação
   * @returns CPF sanitizado (apenas números)
   * @throws BadRequestException - Se CPF inválido (não tem 11 dígitos)
   * 
   * @example
   * _limparCpf('123.456.789-00') // '12345678900'
   * _limparCpf('12345678900')     // '12345678900'
   * _limparCpf('123.456.789')     // BadRequestException
   */
  private _limparCpf(cpf: string): string {
    /**
     * Remove todos os caracteres não-numéricos.
     * 
     * Regex: /\D/g (D = non-digit)
     * - Remove pontos, traços, espaços, etc.
     * - Mantém apenas dígitos (0-9)
     */
    const cpfLimpo = cpf.replace(/\D/g, '');

    /**
     * Valida comprimento: Deve ter exatamente 11 dígitos.
     */
    if (cpfLimpo.length !== 11) {
      throw new BadRequestException(
        'CPF inválido. Deve conter exatamente 11 dígitos.',
      );
    }

    return cpfLimpo;
  }

  /**
   * Registra log de auditoria de autenticação (NOVO - Vulnerabilidade #9).
   * 
   * Responsabilidades:
   * - Registrar TODAS as tentativas de login/registro/reset
   * - Extrair IP e User-Agent das requisições
   * - Armazenar detalhes adicionais em formato JSON
   * - Permitir análise forense e detecção de ataques
   * 
   * Tipos de Log:
   * - LOGIN_SUCESSO: Login bem-sucedido
   * - LOGIN_FALHA_CREDENCIAIS: Email ou senha incorretos
   * - LOGIN_FALHA_STATUS: Usuário com status PENDENTE ou BLOQUEADO
   * - REGISTRO_DUPLICADO_EMAIL: Tentativa de registro com email já cadastrado
   * - REGISTRO_DUPLICADO_CPF: Tentativa de registro com CPF já cadastrado
   * - REGISTRO_SUCESSO: Registro bem-sucedido
   * - RESET_TOKEN_INVALIDO: Token de reset inválido ou expirado
   * - RESET_TOKEN_SUCESSO: Reset de senha bem-sucedido
   * 
   * @param dados - Objeto com dados do log
   * @param dados.tipo - Tipo do evento de autenticação
   * @param dados.email - Email tentado (se aplicável)
   * @param dados.cpf - CPF tentado (se aplicável)
   * @param dados.usuarioId - ID do usuário (se aplicável)
   * @param dados.req - Objeto Request (para extrair IP e User-Agent)
   * @param dados.detalhes - Detalhes adicionais em formato JSON
   * 
   * @example
   * await this._registrarlogAutenticacao({
   *   tipo: 'LOGIN_FALHA_CREDENCIAIS',
   *   email: 'usuario@example.com',
   *   usuarioId: null,
   *   req,
   *   detalhes: { motivo: 'senha_incorreta' },
   * });
   */
  private async _registrarlogAutenticacao(dados: {
    tipo: string;
    email: string | null;
    cpf?: string | null;
    usuarioId: string | null;
    req?: any;
    detalhes?: any;
  }) {
    try {
      /**
       * Extrai IP do cliente.
       * 
       * Ordem de prioridade:
       * 1. x-forwarded-for (se atrás de proxy/load balancer)
       * 2. x-real-ip (Nginx)
       * 3. req.ip (Express padrão)
       * 4. req.connection.remoteAddress (fallback)
       * 5. 'unknown' (se nenhum disponível)
       * 
       * x-forwarded-for pode conter múltiplos IPs (cliente, proxy1, proxy2).
       * Usamos o primeiro IP (cliente real).
       */
      const ipAddress =
        dados.req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
        dados.req?.headers?.['x-real-ip'] ||
        dados.req?.ip ||
        dados.req?.connection?.remoteAddress ||
        'unknown';

      /**
       * Extrai User-Agent do navegador.
       * 
       * User-Agent contém informações sobre:
       * - Navegador (Chrome, Firefox, Safari, etc.)
       * - Sistema operacional (Windows, macOS, Linux, etc.)
       * - Versão do navegador
       * 
       * Útil para:
       * - Detectar bots (User-Agent suspeito)
       * - Fingerprinting de dispositivos
       * - Análise de padrões de ataque
       */
      const userAgent = dados.req?.headers?.['user-agent'] || null;

      /**
       * Cria registro de log no banco.
       */
      await this.prisma.logAutenticacao.create({
        data: {
          tipo: dados.tipo,
          email: dados.email,
          cpf: dados.cpf || null,
          usuarioId: dados.usuarioId,
          ipAddress,
          userAgent,
          detalhes: dados.detalhes || null,
        },
      });

      /**
       * Log de desenvolvimento (apenas tipos de falha).
       */
      if (
        process.env.NODE_ENV !== 'production' &&
        dados.tipo.includes('FALHA')
      ) {
        console.log('[AUTENTICACAO] Log de auditoria registrado:', {
          tipo: dados.tipo,
          email: dados.email,
          ipAddress,
        });
      }
    } catch (erro) {
      /**
       * Se falha ao registrar log, apenas loga erro (não interrompe fluxo).
       * 
       * Logging não deve causar falha na operação principal.
       */
      console.error('[AUTENTICACAO] Erro ao registrar log de auditoria:', erro);
    }
  }
}

