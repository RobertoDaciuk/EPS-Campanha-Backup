/**
 * ============================================================================
 * CAMPANHA SERVICE - Lógica de Negócio do Módulo de Campanhas
 * ============================================================================
 * 
 * Descrição:
 * Serviço responsável por toda a lógica de gerenciamento de campanhas.
 * Implementa criação transacional complexa com DTOs aninhados.
 * 
 * Responsabilidades:
 * - Criar campanha completa com cartelas, requisitos e condições (transação atômica)
 * - Listar campanhas
 * - Buscar campanha por ID com dados aninhados completos
 * - Atualizar dados básicos da campanha
 * - Remover campanha (soft delete ou hard delete)
 * 
 * Complexidade:
 * Este é o serviço mais complexo do sistema até agora, pois lida com:
 * - Transações atômicas (garantia de integridade)
 * - Dados profundamente aninhados (4 níveis de hierarquia)
 * - Validação em cascata
 * 
 * @module CampanhasModule
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
   * 
   * @param prisma - Serviço Prisma para acesso ao banco de dados
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma campanha completa com toda sua estrutura aninhada.
   * 
   * Esta é a operação mais complexa do sistema. Usa transação atômica
   * para garantir que TODOS os dados sejam criados com sucesso ou
   * NENHUM dado seja persistido (rollback automático em caso de erro).
   * 
   * Fluxo de Criação:
   * 1. Inicia transação
   * 2. Cria Campanha base
   * 3. Loop: Para cada cartela do DTO
   *    3.1. Cria RegraCartela
   *    3.2. Loop: Para cada requisito da cartela
   *         3.2.1. Cria RequisitoCartela
   *         3.2.2. Loop: Para cada condição do requisito
   *                3.2.2.1. Cria CondicaoRequisito
   * 4. Commit da transação (se tudo OK)
   * 5. Rollback automático (se qualquer erro)
   * 
   * @param dto - Dados completos da campanha (aninhados)
   * @returns Campanha criada
   * 
   * @throws {BadRequestException} Se dados inválidos ou duplicados
   * 
   * @example
   * ```
   * const campanha = await campanhaService.criar({
   *   titulo: "Campanha Lentes Q1 2025",
   *   descricao: "...",
   *   dataInicio: "2025-01-01",
   *   dataFim: "2025-03-31",
   *   pontosPorCartela: 1000,
   *   valorPorCartela: 500,
   *   percentualGerente: 0.10,
   *   cartelas: [
   *     {
   *       numeroCartela: 1,
   *       descricao: "Cartela Bronze",
   *       requisitos: [
   *         {
   *           descricao: "Lentes BlueProtect Max",
   *           quantidade: 5,
   *           tipoUnidade: "PAR",
   *           condicoes: [
   *             {
   *               campo: "NOME_PRODUTO",
   *               operador: "CONTEM",
   *               valor: "BlueProtect"
   *             }
   *           ]
   *         }
   *       ]
   *     }
   *   ]
   * });
   * ```
   */
  async criar(dto: CriarCampanhaDto): Promise<Campanha> {
    this.logger.log(`Criando campanha: ${dto.titulo}`);

    /**
     * Validação de datas.
     * 
     * dataFim deve ser posterior a dataInicio.
     */
    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);

    if (dataFim <= dataInicio) {
      throw new BadRequestException(
        'A data de término deve ser posterior à data de início',
      );
    }

    /**
     * Transação atômica.
     *
     * Prisma.$transaction garante que todas as operações sejam bem-sucedidas
     * ou nenhuma seja persistida. Isso é CRÍTICO para integridade de dados.
     *
     * Se qualquer operação dentro do bloco falhar (throw Error):
     * - Todas as operações anteriores são revertidas (rollback)
     * - Banco volta ao estado anterior
     * - Erro é propagado para o controller
     *
     * Isolamento: Nenhum outro processo vê dados parciais durante a transação.
     */
    return this.prisma.$transaction(async (tx) => {
      /**
       * PASSO 1: Criar Campanha Base (ATUALIZADO - Sprint 17, Tarefa 41)
       *
       * Cria o registro principal da campanha, incluindo targeting de óticas.
       */

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
      // NOVO (Sprint 17): Validar e conectar Óticas Alvo
      // -----------------------------------------------------------------------
      if (!dadosCampanha.paraTodasOticas && dto.oticasAlvoIds && dto.oticasAlvoIds.length > 0) {
        // Validação: Verificar se todos os IDs de Ótica existem e estão ativos
        const countOticas = await this.prisma.optica.count({
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
       * PASSO 2: Criar Cartelas (Regras de Cartela)
       * 
       * Loop sequencial pelas cartelas do DTO.
       * Usa for...of para manter ordem e aguardar cada criação.
       */
      for (const cartelaDto of dto.cartelas) {
        this.logger.log(
          `Criando cartela ${cartelaDto.numeroCartela} para campanha ${campanha.id}`,
        );

        /**
         * Cria RegraCartela.
         * 
         * Vincula à campanha recém-criada via campanhaId.
         */
        const regraCartela = await tx.regraCartela.create({
          data: {
            numeroCartela: cartelaDto.numeroCartela,
            descricao: cartelaDto.descricao,
            campanhaId: campanha.id,
          },
        });

        /**
         * PASSO 3: Criar Requisitos da Cartela
         *
         * Loop sequencial pelos requisitos de cada cartela.
         *
         * ATUALIZADO Sprint 16.5 - Tarefa 38.7:
         * - Agora persiste o campo ordem vindo do DTO
         * - Este campo é CRÍTICO para spillover correto entre cartelas
         */
        for (const requisitoDto of cartelaDto.requisitos) {
          this.logger.log(
            `Criando requisito "${requisitoDto.descricao}" (ordem ${requisitoDto.ordem}) para cartela ${regraCartela.numeroCartela}`,
          );

          /**
           * Cria RequisitoCartela.
           *
           * Vincula à regra de cartela recém-criada via regraCartelaId.
           *
           * IMPORTANTE: O campo ordem permite agrupar requisitos relacionados
           * entre cartelas diferentes (ex: "Lentes X" ordem=1 em todas as cartelas).
           */
          const requisito = await tx.requisitoCartela.create({
            data: {
              descricao: requisitoDto.descricao,
              quantidade: requisitoDto.quantidade,
              tipoUnidade: requisitoDto.tipoUnidade,
              ordem: requisitoDto.ordem, // ✅ ADICIONADO Sprint 16.5
              regraCartelaId: regraCartela.id,
            },
          });

          /**
           * PASSO 4: Criar Condições do Requisito (Rule Builder)
           * 
           * Loop sequencial pelas condições de cada requisito.
           */
          for (const condicaoDto of requisitoDto.condicoes) {
            this.logger.log(
              `Criando condição ${condicaoDto.campo} ${condicaoDto.operador} "${condicaoDto.valor}" para requisito ${requisito.id}`,
            );

            /**
             * Cria CondicaoRequisito.
             * 
             * Vincula ao requisito recém-criado via requisitoId.
             */
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

      /**
       * Retorna a campanha criada.
       * 
       * A transação é automaticamente commitada ao final do bloco
       * se nenhum erro foi lançado.
       */
      return campanha;
    });
  }

  /**
   * Lista campanhas visíveis para o usuário logado.
   *
   * ATUALIZADO (Sprint 17 - Tarefa 42):
   * - Filtra campanhas baseado no papel e ótica do usuário
   * - Admin vê todas as campanhas
   * - Vendedores/Gerentes veem apenas campanhas direcionadas para sua ótica ou matriz
   *
   * Retorna campanhas ordenadas por data de início (mais recentes primeiro).
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

    // Admin vê tudo (ou ajuste se Admin também for ligado a ótica)
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
   * ATUALIZADO (Sprint 17 - Tarefa 42):
   * - Inclui oticasAlvo no retorno (para frontend saber quem é o alvo)
   * - Verifica se o usuário tem permissão para ver esta campanha (segurança)
   * - Parâmetro usuario opcional (para chamadas internas do serviço)
   *
   * Retorna campanha com toda a estrutura hierárquica carregada:
   * - Campanha
   *   └─ Cartelas
   *       └─ Requisitos
   *           └─ Condições
   *   └─ Óticas Alvo (Sprint 17)
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
          select: { id: true, nome: true }, // Sprint 17: Inclui óticas alvo
        },
      },
    });

    if (!campanha) {
      this.logger.warn(`Campanha não encontrada: ${id}`);
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    // -----------------------------------------------------------------------
    // NOVO (Sprint 17): Verificação de Acesso (Segurança)
    // Apenas valida se usuário for fornecido (chamadas via controller)
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

    // Se chegou aqui, o usuário tem permissão (ou é chamada interna)
    return campanha;
  }

  /**
   * Atualiza dados básicos de uma campanha existente.
   *
   * Permite atualização parcial apenas dos campos da campanha base.
   * NÃO permite atualizar cartelas/requisitos/condições aninhadas.
   *
   * Para alterar estrutura de cartelas, Admin deve criar nova campanha.
   *
   * ATUALIZADO (Sprint 17 - Tarefa 41):
   * - Permite atualizar paraTodasOticas
   * - NÃO permite atualizar oticasAlvo (simplificação)
   *
   * @param id - UUID da campanha
   * @param dto - Dados a serem atualizados
   * @returns Campanha atualizada
   *
   * @throws {NotFoundException} Se campanha não encontrada
   */
  async atualizar(id: string, dto: AtualizarCampanhaDto): Promise<Campanha> {
    this.logger.log(`Atualizando campanha: ${id}`);

    // Verifica se campanha existe
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

    // Adiciona paraTodasOticas se presente no DTO (Sprint 17)
    if (dto.paraTodasOticas !== undefined) {
      dados.paraTodasOticas = dto.paraTodasOticas;

      // IMPORTANTE: Se paraTodasOticas vira TRUE, idealmente deveríamos limpar a relação oticasAlvo
      // Decisão: Manter simples por agora, só atualiza o boolean.
      // if (dto.paraTodasOticas === true) {
      //   dados.oticasAlvo = { set: [] }; // Desconecta todas as óticas
      // }
    }

    // Remove campos não permitidos no update (garantia extra, já está no DTO)
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
   * 
   * Implementação atual: Hard delete (deleta fisicamente).
   * 
   * Cascata: Prisma automaticamente remove:
   * - Todas as RegraCartela da campanha (onDelete: Cascade)
   * - Todos os RequisitoCartela dessas cartelas (onDelete: Cascade)
   * - Todas as CondicaoRequisito desses requisitos (onDelete: Cascade)
   * 
   * Para soft delete, altere para:
   * await this.prisma.campanha.update({ where: { id }, data: { status: 'INATIVA' } })
   * 
   * @param id - UUID da campanha
   * @returns Campanha removida
   * 
   * @throws {NotFoundException} Se campanha não encontrada
   */
  async remover(id: string): Promise<Campanha> {
    this.logger.log(`Removendo campanha: ${id}`);

    // Verifica se campanha existe
    await this.buscarPorId(id);

    // Hard delete (deleção física com cascata automática)
    const campanha = await this.prisma.campanha.delete({
      where: { id },
    });

    this.logger.log(
      `✅ Campanha deletada permanentemente: ${campanha.titulo}`,
    );

    return campanha;

    // Alternativa: Soft delete (desativar campanha)
    // const campanha = await this.prisma.campanha.update({
    //   where: { id },
    //   data: { status: 'INATIVA' },
    // });
    // this.logger.log(`✅ Campanha desativada: ${campanha.titulo}`);
    // return campanha;
  }
}
