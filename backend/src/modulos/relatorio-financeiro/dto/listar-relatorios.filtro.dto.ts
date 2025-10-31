import { IsEnum, IsOptional, IsUUID, IsDateString, IsString } from 'class-validator';
import { StatusPagamento } from '@prisma/client';

/**
 * DTO para filtros de consulta de relatórios financeiros.
 * Todos os campos são opcionais e podem ser combinados.
 */
export class ListarRelatoriosFiltroDto {
  @IsOptional()
  @IsEnum(StatusPagamento)
  status?: StatusPagamento;

  @IsOptional()
  @IsUUID()
  campanhaId?: string;

  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
