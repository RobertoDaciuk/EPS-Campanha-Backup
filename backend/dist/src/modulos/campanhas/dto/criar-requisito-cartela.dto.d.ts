import { TipoUnidade } from '@prisma/client';
import { CriarCondicaoRequisitoDto } from './criar-condicao-requisito.dto';
export declare class CriarRequisitoCartelaDto {
    descricao: string;
    quantidade: number;
    tipoUnidade: TipoUnidade;
    ordem: number;
    condicoes: CriarCondicaoRequisitoDto[];
}
