import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PapelUsuario, StatusUsuario } from '@prisma/client';
import { PaginacaoRankingDto } from './dto/paginacao-ranking.dto';

/**
 * Serviço dedicado à lógica de ranking (global, equipe e posições).
 *
 * ATUALIZADO (Sprint 17 - Tarefa 43):
 * - Adicionado método getRankingFiliaisParaMatriz para Gerentes de Matriz
 */
@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula a posição de um usuário no ranking global dos vendedores,
   * levando em conta desempate por 'rankingMoedinhas' (desc) e 'criadoEm' (asc).
   * @param usuarioId ID do usuário a consultar
   */
  async getPosicaoUsuario(usuarioId: string): Promise<{ posicao: number }> {
    // O model Usuario possui campo 'criadoEm'
    const todosUsuarios = await this.prisma.usuario.findMany({
      where: { papel: PapelUsuario.VENDEDOR },
      select: { id: true },
      orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
    });
    const posicao = todosUsuarios.findIndex((u) => u.id === usuarioId) + 1;
    return { posicao };
  }

  /**
   * Retorna o ranking da equipe de um gerente (somente seus vendedores).
   * @param gerenteId ID do gerente
   */
  async getRankingEquipe(gerenteId: string) {
    return this.prisma.usuario.findMany({
      where: { gerenteId },
      select: { id: true, nome: true, avatarUrl: true, rankingMoedinhas: true },
      orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
    });
  }

  /**
   * Retorna o ranking global de vendedores com paginação e desempate.
   *
   * ATUALIZADO (Sprint 17 - Tarefa 39):
   * - Inclui o nome da ótica para exibição no frontend
   * - CRÍTICO: Calcula e adiciona o campo `posicao` para cada usuário
   *
   * @param dto PaginacaoRankingDto com filtros de página e quantidade
   */
  async getRankingGeralPaginado(dto: PaginacaoRankingDto) {
    const pagina = dto.pagina ?? 1;
    const porPagina = dto.porPagina ?? 20;
    const skip = (pagina - 1) * porPagina;
    const take = porPagina;

    const [usuarios, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where: { papel: PapelUsuario.VENDEDOR },
        select: {
          id: true,
          nome: true,
          avatarUrl: true,
          rankingMoedinhas: true,
          nivel: true,
          optica: {
            select: {
              nome: true,
            },
          },
        },
        orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
        skip,
        take,
      }),
      this.prisma.usuario.count({ where: { papel: PapelUsuario.VENDEDOR } }),
    ]);

    const totalPaginas = Math.ceil(total / porPagina);

    // ========================================
    // CALCULAR POSIÇÃO DE CADA USUÁRIO
    // ========================================
    /**
     * A posição é calculada com base no offset (skip) da paginação.
     *
     * Exemplos:
     * - Página 1 (skip=0): Posições 1, 2, 3, ..., 20
     * - Página 2 (skip=20): Posições 21, 22, 23, ..., 40
     *
     * Fórmula: posicao = skip + index + 1
     */
    const dadosComPosicao = usuarios.map((usuario, index) => ({
      ...usuario,
      posicao: skip + index + 1, // ✅ Adiciona campo posicao
    }));

    return {
      dados: dadosComPosicao,
      paginaAtual: pagina,
      totalPaginas,
      totalRegistros: total,
    };
  }

  /**
   * Retorna o ranking agrupado por filial para Gerentes de Matriz.
   *
   * NOVO (Sprint 17 - Tarefa 43):
   * - Busca rankings separados da Matriz e de cada Filial
   * - Apenas Gerentes de Matriz podem acessar
   *
   * @param matrizGerenteId - ID do gerente da matriz
   * @returns Ranking agrupado (matriz + filiais)
   * @throws {ForbiddenException} Se o usuário não for Gerente de Matriz
   */
  async getRankingFiliaisParaMatriz(matrizGerenteId: string): Promise<any> {
    this.logger.log(`Buscando rankings por filial para Gerente Matriz ID: ${matrizGerenteId}`);

    // 1. Buscar o gerente e sua ótica Matriz com as Filiais
    const gerenteMatriz = await this.prisma.usuario.findUnique({
      where: { id: matrizGerenteId, papel: PapelUsuario.GERENTE },
      include: {
        optica: {
          include: {
            filiais: {
              // Busca as filiais ligadas a esta matriz
              select: { id: true, nome: true },
              where: { ativa: true }, // Considera apenas filiais ativas
              orderBy: { nome: 'asc' },
            },
          },
        },
      },
    });

    // Validação: Usuário é gerente? Está ligado a uma ótica? A ótica é matriz?
    if (!gerenteMatriz || !gerenteMatriz.optica || !gerenteMatriz.optica.ehMatriz) {
      this.logger.warn(`Usuário ${matrizGerenteId} não é um Gerente de Matriz válido.`);
      throw new ForbiddenException(
        'Acesso negado. Apenas gerentes de matriz podem ver rankings por filial.',
      );
    }

    const matriz = gerenteMatriz.optica;
    const filiais = matriz.filiais;

    // Função auxiliar para buscar ranking de uma ótica
    const buscarRankingOptica = async (opticaId: string) => {
      return this.prisma.usuario.findMany({
        where: {
          opticaId: opticaId,
          papel: PapelUsuario.VENDEDOR,
          status: StatusUsuario.ATIVO,
        },
        select: {
          id: true,
          nome: true,
          avatarUrl: true,
          rankingMoedinhas: true,
          nivel: true,
        },
        orderBy: [{ rankingMoedinhas: 'desc' }, { criadoEm: 'asc' }],
        take: 100, // Limite para evitar sobrecarga
      });
    };

    // 2. Buscar ranking da Matriz e de cada Filial (em paralelo)
    const [rankingMatriz, ...rankingsFiliais] = await Promise.all([
      buscarRankingOptica(matriz.id),
      ...filiais.map(filial => buscarRankingOptica(filial.id)),
    ]);

    // 3. Montar a resposta estruturada
    const resultado = {
      matriz: {
        id: matriz.id,
        nome: matriz.nome,
        ranking: rankingMatriz,
      },
      filiais: filiais.map((filial, index) => ({
        id: filial.id,
        nome: filial.nome,
        ranking: rankingsFiliais[index],
      })),
    };

    this.logger.log(
      `Rankings por filial para Gerente ${matrizGerenteId} (${matriz.nome}) buscados com sucesso.`,
    );
    return resultado;
  }
}
