/**
 * ============================================================================
 * DTO: Criar Campanha
 * ============================================================================
 * 
 * Descrição:
 * Data Transfer Object mestre para criação de uma campanha completa.
 * Este é o DTO de mais alto nível que encapsula toda a hierarquia aninhada.
 * 
 * Recebe do Admin todos os dados necessários para criar:
 * - A campanha base (título, datas, pontuação)
 * - As cartelas (Cartela 1, 2, 3, etc.)
 * - Os requisitos de cada cartela (cards)
 * - As condições de validação de cada requisito (Rule Builder)
 * 
 * Hierarquia de Aninhamento:
 * CriarCampanhaDto ← (Este arquivo)
 *   └─ CriarRegraCartelaDto[]
 *       └─ CriarRequisitoCartelaDto[]
 *           └─ CriarCondicaoRequisitoDto[]
 * 
 * @module CampanhasModule
 * ============================================================================
 */

import {
  IsString,
  IsDateString,
  IsNumber,
  IsInt,
  ValidateNested,
  IsArray,
  Min,
  Max,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsUUID,
  ArrayNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CriarRegraCartelaDto } from './criar-regra-cartela.dto';

/**
 * DTO para criação de uma campanha completa.
 * 
 * Encapsula toda a estrutura hierárquica da campanha:
 * Campanha → Cartelas → Requisitos → Condições
 * 
 * @example
 * ```
 * {
 *   titulo: "Campanha Lentes Q1 2025",
 *   descricao: "Campanha focada em lentes premium...",
 *   dataInicio: "2025-01-01",
 *   dataFim: "2025-03-31",
 *   moedinhasPorCartela: 1000,
 *   pontosReaisPorCartela: 500.00,
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
 * }
 * ```
 */
export class CriarCampanhaDto {
  /**
   * Título da campanha.
   * 
   * Deve ser descritivo e único para fácil identificação.
   * 
   * @example "Campanha Lentes Q1 2025"
   */
  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título não pode estar vazio' })
  titulo: string;

  /**
   * Descrição detalhada da campanha.
   * 
   * Explica objetivos, regras e benefícios da campanha.
   * 
   * @example "Campanha focada em lentes premium com bonificação especial..."
   */
  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição não pode estar vazia' })
  descricao: string;

  /**
   * Data de início da campanha (formato ISO 8601).
   * 
   * Vendas só são válidas a partir desta data.
   * 
   * @example "2025-01-01"
   */
  @IsDateString({}, { message: 'A data de início deve estar no formato válido (YYYY-MM-DD)' })
  dataInicio: string;

  /**
   * Data de término da campanha (formato ISO 8601).
   * 
   * Vendas só são válidas até esta data.
   * 
   * @example "2025-03-31"
   */
  @IsDateString({}, { message: 'A data de término deve estar no formato válido (YYYY-MM-DD)' })
  dataFim: string;

  /**
   * Moedinhas EPS (moeda virtual) creditadas ao vendedor por cartela completada.
   *
   * Usadas para ranking e resgate de prêmios.
   *
   * @example 1000
   */
  @IsInt({ message: 'As moedinhas por cartela devem ser um número inteiro' })
  @Min(0, { message: 'As moedinhas por cartela não podem ser negativas' })
  moedinhasPorCartela: number;

  /**
   * Pontos equivalentes a R$ (1 Ponto = R$ 1,00) que o vendedor recebe por cartela completada.
   *
   * Gera RelatorioFinanceiro para pagamento real.
   *
   * @example 500.00
   */
  @IsNumber({}, { message: 'Os pontos reais por cartela devem ser um número' })
  @Min(0, { message: 'Os pontos reais por cartela não podem ser negativos' })
  pontosReaisPorCartela: number;

  /**
   * Percentual de comissão que o gerente recebe.
   * 
   * Valor entre 0.0 e 1.0 (ex: 0.10 = 10%).
   * Gerente recebe este percentual do valorPorCartela de seus vendedores.
   * 
   * @example 0.10 (10%)
   */
  @IsNumber({}, { message: 'O percentual do gerente deve ser um número' })
  @Min(0, { message: 'O percentual do gerente não pode ser negativo' })
  @Max(1, { message: 'O percentual do gerente não pode ser maior que 1 (100%)' })
  percentualGerente: number;

  /**
   * Lista de cartelas (regras) desta campanha.
   *
   * Cada cartela representa um nível de objetivos que o vendedor deve cumprir.
   *
   * Mínimo: 1 cartela (campanha precisa ter pelo menos uma cartela)
   * Ordem: Cartelas devem ser numeradas sequencialmente (1, 2, 3, etc.)
   *
   * @example
   * ```
   * [
   *   {
   *     numeroCartela: 1,
   *     descricao: "Cartela Bronze",
   *     requisitos: [...]
   *   },
   *   {
   *     numeroCartela: 2,
   *     descricao: "Cartela Prata",
   *     requisitos: [...]
   *   }
   * ]
   * ```
   */
  @IsArray({ message: 'As cartelas devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CriarRegraCartelaDto)
  @IsNotEmpty({ message: 'A campanha deve ter pelo menos uma cartela' })
  cartelas: CriarRegraCartelaDto[];

  // ========================================================================
  // NOVOS CAMPOS (Sprint 17 - Tarefa 41): Targeting de Campanhas
  // ========================================================================

  /**
   * Indica se a campanha é válida para todas as óticas.
   * Se true, o campo oticasAlvoIds é ignorado.
   * Se false (ou omitido), oticasAlvoIds é obrigatório.
   * (Adicionado no Sprint 17)
   *
   * @example true (campanha para todas as óticas)
   * @example false (campanha apenas para óticas selecionadas)
   */
  @IsBoolean({ message: 'O campo paraTodasOticas deve ser booleano.' })
  @IsOptional()
  paraTodasOticas?: boolean;

  /**
   * Lista de IDs (UUIDs) das Óticas (Matrizes e/ou Filiais) que são alvo desta campanha.
   * Obrigatório se paraTodasOticas for false ou omitido.
   * Ignorado se paraTodasOticas for true.
   * (Adicionado no Sprint 17)
   *
   * @example ["uuid-matriz-1", "uuid-filial-2", "uuid-filial-3"]
   */
  @ValidateIf(o => o.paraTodasOticas === false || o.paraTodasOticas === undefined)
  @IsArray({ message: 'oticasAlvoIds deve ser um array.' })
  @ArrayNotEmpty({ message: 'Se a campanha não for para todas as óticas, ao menos uma ótica alvo deve ser especificada.' })
  @IsUUID('4', { each: true, message: 'Cada ID de ótica alvo deve ser um UUID válido.' })
  oticasAlvoIds?: string[];
}
