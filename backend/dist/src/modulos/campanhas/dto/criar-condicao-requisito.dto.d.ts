import { CampoVerificacao, OperadorCondicao } from '@prisma/client';
export declare class CriarCondicaoRequisitoDto {
    campo: CampoVerificacao;
    operador: OperadorCondicao;
    valor: string;
}
