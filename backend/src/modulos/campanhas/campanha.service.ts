/**
 * ============================================================================
 * CAMPANHA SERVICE - Lógica de Negócio do Módulo de Campanhas (REFATORADO)
 * ============================================================================
 * * Descrição:
 * Serviço responsável por toda a lógica de gerenciamento de campanhas.
 * * REFATORAÇÃO (Q.I. 170):
 * - NOVO: Validação manual de unicidade do campo `ordem` dentro de cada cartela
 * no método `criar` (Princípio 1 - Integridade Lógica Crítica).
 * - CORRIGIDO: O método `remover` agora recebe e usa o contexto do `usuario`
 * logado para verificar a existência da campanha através do método seguro
 * `buscarPorId(id, usuario)` (Princípio 5.5 - Isolamento de Dados).
 * * Complexidade:
 * - Transações atômicas (garantia de integridade)
 * - Dados profundamente aninhados (4 níveis de hierarquia)
 * * @module CampanhasModule
 * ============================================================================
 */

import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CriarCampanhaDto } from './dto/criar-campanha.dto';
import { AtualizarCampanhaDto } from './dto/atualizar-campanha.dto';
import { Campanha, Prisma, PapelUsuario } from '@prisma/client';

/**
 * Serviço de gerenciamento de campanhas.
 */
@Injectable()
export class CampanhaService {
  /**
   * Logger dedicado para rastrear operações do módulo de campanhas.
   */
  private readonly logger = new Logger(CampanhaService.name);

  /**
   * Construtor do serviço.
   * * @param prisma - Serviço Prisma para acesso ao banco de dados
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma campanha completa com toda sua estrutura aninhada.
   * * @param dto - Dados completos da campanha (aninhados)
   * @returns Campanha criada
   * * @throws {BadRequestException} Se datas inválidas, IDs de Ótica inválidos,
   * ou se a regra de negócio da `ordem` (unicidade dentro da cartela) for violada.
   */
  async criar(dto: CriarCampanhaDto): Promise<Campanha> {
    this.logger.log(`Criando campanha: ${dto.titulo}`);

    /**
     * Validação de Datas (Pre-check)
     */
    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);

    if (dataFim <= dataInicio) {
      throw new BadRequestException(
        'A data de término deve ser posterior à data de início',
      );
    }

    /**
     * VALIDAÇÃO DE NEGÓCIO CRÍTICA (Princípio 1 - Unicidade de Ordem)
     * * Garante que o campo `ordem` seja único dentro de cada array de requisitos
     * de UMA ÚNICA cartela.
     */
    for (const cartelaDto of dto.cartelas) {
      const ordensEncontradas = new Set<number>();
      for (const requisitoDto of cartelaDto.requisitos) {
        if (ordensEncontradas.has(requisitoDto.ordem)) {
          throw new BadRequestException(
            `A Cartela ${cartelaDto.numeroCartela} possui requisitos com a Ordem (${requisitoDto.ordem}) duplicada. A Ordem deve ser única dentro da mesma cartela.`,
          );
        }
        ordensEncontradas.add(requisitoDto.ordem);
      }
    }

    /**
     * Transação atômica.
     */
    return this.prisma.$transaction(async (tx) => {
      // Construir objeto de dados da campanha
      const dadosCampanha: Prisma.CampanhaCreateInput = {
        titulo: dto.titulo,
        descricao: dto.descricao,
        dataInicio,
        dataFim,
        moedinhasPorCartela: dto.moedinhasPorCartela,
        pontosReaisPorCartela: dto.pontosReaisPorCartela,
        percentualGerente: dto.percentualGerente,
        status: 'ATIVA',
        paraTodasOticas: dto.paraTodasOticas ?? false, // Default false se omitido
      };

      // -----------------------------------------------------------------------
      // Validar e conectar Óticas Alvo (Targeting)
      // -----------------------------------------------------------------------
      if (!dadosCampanha.paraTodasOticas && dto.oticasAlvoIds && dto.oticasAlvoIds.length > 0) {
        // Validação: Verificar se todos os IDs de Ótica existem e estão ativos
        const countOticas = await tx.optica.count({ // Usar tx para consistência
          where: { id: { in: dto.oticasAlvoIds }, ativa: true },
        });

        if (countOticas !== dto.oticasAlvoIds.length) {
          throw new BadRequestException(
            'Um ou mais IDs de Óticas Alvo são inválidos ou inativos.',
          );
        }

        // Conectar óticas via relação muitos-para-muitos
        dadosCampanha.oticasAlvo = {
          connect: dto.oticasAlvoIds.map(id => ({ id })),
        };

        this.logger.log(`Campanha direcionada para ${dto.oticasAlvoIds.length} ótica(s) específica(s).`);
      } else if (dadosCampanha.paraTodasOticas) {
        this.logger.log(`Campanha criada para TODAS as óticas (paraTodasOticas=true).`);
      }

      const campanha = await tx.campanha.create({ data: dadosCampanha });

      this.logger.log(`Campanha base criada: ${campanha.id}`);

      /**
       * PASSO 2, 3 e 4: Criar Cartelas, Requisitos e Condições (Loop Aninhado)
       */
      for (const cartelaDto of dto.cartelas) {
        this.logger.log(
          `Criando cartela ${cartelaDto.numeroCartela} para campanha ${campanha.id}`,
        );

        const regraCartela = await tx.regraCartela.create({
          data: {
            numeroCartela: cartelaDto.numeroCartela,
            descricao: cartelaDto.descricao,
            campanhaId: campanha.id,
          },
        });

        for (const requisitoDto of cartelaDto.requisitos) {
          this.logger.log(
            `Criando requisito "${requisitoDto.descricao}" (ordem ${requisitoDto.ordem}) para cartela ${regraCartela.numeroCartela}`,
          );

          const requisito = await tx.requisitoCartela.create({
            data: {
              descricao: requisitoDto.descricao,
              quantidade: requisitoDto.quantidade,
              tipoUnidade: requisitoDto.tipoUnidade,
              ordem: requisitoDto.ordem,
              regraCartelaId: regraCartela.id,
            },
          });

          for (const condicaoDto of requisitoDto.condicoes) {
            this.logger.log(
              `Criando condição ${condicaoDto.campo} ${condicaoDto.operador} "${condicaoDto.valor}" para requisito ${requisito.id}`,
            );

            await tx.condicaoRequisito.create({
              data: {
                campo: condicaoDto.campo,
                operador: condicaoDto.operador,
                valor: condicaoDto.valor,
                requisitoId: requisito.id,
              },
            });
          }
        }
      }

      this.logger.log(
        `✅ Campanha "${campanha.titulo}" criada com sucesso (ID: ${campanha.id})`,
      );

      return campanha;
    });
  }

  /**
   * Lista campanhas visíveis para o usuário logado.
   *
   * @param usuario - Dados do usuário logado (id, papel, opticaId)
   * @returns Array de campanhas
   */
  async listar(usuario: { id: string; papel: PapelUsuario; opticaId?: string | null }): Promise<Campanha[]> {
    this.logger.log(`Listando campanhas para usuário: ${usuario.id} (${usuario.papel})`);

    // Construir filtro where baseado no usuário
    const where: Prisma.CampanhaWhereInput = {
      status: 'ATIVA', // Filtra apenas campanhas ativas (ajuste se necessário)
    };

    // Admin vê tudo
    if (usuario.papel !== PapelUsuario.ADMIN) {
      const condicoesVisibilidade: Prisma.CampanhaWhereInput[] = [
        { paraTodasOticas: true }, // Condição 1: Campanha para todos
      ];

      if (usuario.opticaId) {
        // Buscar a ótica do usuário e seu matrizId
        const opticaUsuario = await this.prisma.optica.findUnique({
          where: { id: usuario.opticaId },
          select: { id: true, matrizId: true },
        });

        if (opticaUsuario) {
          // Condição 2: Campanha direcionada para a Ótica do usuário
          condicoesVisibilidade.push({
            oticasAlvo: { some: { id: opticaUsuario.id } },
          });

          // Condição 3: Campanha direcionada para a Matriz do usuário
          if (opticaUsuario.matrizId) {
            condicoesVisibilidade.push({
              oticasAlvo: { some: { id: opticaUsuario.matrizId } },
            });
          }
        }
      }

      where.OR = condicoesVisibilidade;
    }

    const campanhas = await this.prisma.campanha.findMany({
      where,
      orderBy: { dataInicio: 'desc' },
    });

    this.logger.log(`📋 ${campanhas.length} campanha(s) encontrada(s) para usuário ${usuario.id}`);

    return campanhas;
  }

  /**
   * Busca uma campanha específica pelo ID com dados aninhados completos.
   *
   * @param id - UUID da campanha
   * @param usuario - Dados do usuário logado (opcional para chamadas internas)
   * @returns Campanha com dados aninhados
   *
   * @throws {NotFoundException} Se campanha não encontrada ou não acessível
   */
  async buscarPorId(
    id: string,
    usuario?: { id: string; papel: PapelUsuario; opticaId?: string | null },
  ) {
    this.logger.log(`Buscando campanha por ID: ${id}${usuario ? ` (usuário: ${usuario.id})` : ' (chamada interna)'}`);

    const campanha = await this.prisma.campanha.findUnique({
      where: { id },
      include: {
        cartelas: {
          orderBy: { numeroCartela: 'asc' },
          include: {
            requisitos: {
              include: {
                condicoes: true,
              },
            },
          },
        },
        oticasAlvo: {
          select: { id: true, nome: true },
        },
      },
    });

    if (!campanha) {
      this.logger.warn(`Campanha não encontrada: ${id}`);
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    // -----------------------------------------------------------------------
    // Verificação de Acesso (Segurança - Princípio 5.5)
    // -----------------------------------------------------------------------
    if (usuario && usuario.papel !== PapelUsuario.ADMIN) {
      let podeVer = campanha.paraTodasOticas; // Verifica se é para todos

      if (!podeVer && usuario.opticaId) {
        // Verifica se está no alvo direto
        if (campanha.oticasAlvo.some(otica => otica.id === usuario.opticaId)) {
          podeVer = true;
        } else {
          // Verifica se está no alvo da matriz
          const opticaUsuario = await this.prisma.optica.findUnique({
            where: { id: usuario.opticaId },
            select: { matrizId: true },
          });
          if (
            opticaUsuario?.matrizId &&
            campanha.oticasAlvo.some(otica => otica.id === opticaUsuario.matrizId)
          ) {
            podeVer = true;
          }
        }
      }

      if (!podeVer) {
        this.logger.warn(`Usuário ${usuario.id} tentou acessar campanha restrita ${id}.`);
        throw new NotFoundException(
          `Campanha com ID ${id} não encontrada ou não acessível.`,
        ); // Retorna 404 por segurança
      }
    }

    return campanha;
  }

  /**
   * Atualiza dados básicos de uma campanha existente.
   *
   * @param id - UUID da campanha
   * @param dto - Dados a serem atualizados
   * @returns Campanha atualizada
   *
   * @throws {NotFoundException} Se campanha não encontrada
   */
  async atualizar(id: string, dto: AtualizarCampanhaDto): Promise<Campanha> {
    this.logger.log(`Atualizando campanha: ${id}`);

    // Verifica se campanha existe e se é acessível (Admin sempre acessa)
    await this.buscarPorId(id);

    // Valida datas se ambas fornecidas
    if (dto.dataInicio && dto.dataFim) {
      const dataInicio = new Date(dto.dataInicio);
      const dataFim = new Date(dto.dataFim);

      if (dataFim <= dataInicio) {
        throw new BadRequestException(
          'A data de término deve ser posterior à data de início',
        );
      }
    }

    // Converte datas para Date se fornecidas
    const dados: Prisma.CampanhaUpdateInput = { ...dto };
    if (dto.dataInicio) {
      dados.dataInicio = new Date(dto.dataInicio);
    }
    if (dto.dataFim) {
      dados.dataFim = new Date(dto.dataFim);
    }

    if (dto.paraTodasOticas !== undefined) {
      dados.paraTodasOticas = dto.paraTodasOticas;
    }

    // Remove campos não permitidos no update (garantia extra)
    delete dados['cartelas'];
    delete dados['oticasAlvoIds'];

    const campanha = await this.prisma.campanha.update({
      where: { id },
      data: dados,
    });

    this.logger.log(`✅ Campanha atualizada: ${campanha.titulo}`);

    return campanha;
  }

  /**
   * Remove uma campanha do sistema.
   * * CORREÇÃO (Princípio 5.5 - Segurança/Isolamento de Dados):
   * - O método agora recebe o contexto do usuário e usa `buscarPorId` para
   * garantir que a campanha existe e o usuário tem permissão para acessá-la
   * antes de deletar.
   * * @param id - UUID da campanha
   * @param usuario - Dados do usuário logado (usado para verificar acesso)
   * @returns Campanha removida
   * * @throws {NotFoundException} Se campanha não encontrada
   */
  async remover(
    id: string,
    usuario: { id: string; papel: PapelUsuario; opticaId?: string | null },
  ): Promise<Campanha> {
    this.logger.log(`Removendo campanha: ${id}`);

    // Verifica se campanha existe E se é acessível ao usuário (Admin sempre passa)
    await this.buscarPorId(id, usuario);

    // Hard delete (deleção física com cascata automática)
    const campanha = await this.prisma.campanha.delete({
      where: { id },
    });

    this.logger.log(
      `✅ Campanha deletada permanentemente: ${campanha.titulo}`,
    );

    return campanha;
  }
}