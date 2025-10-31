import { CriarRegraCartelaDto } from './criar-regra-cartela.dto';
export declare class CriarCampanhaDto {
    titulo: string;
    descricao: string;
    dataInicio: string;
    dataFim: string;
    moedinhasPorCartela: number;
    pontosReaisPorCartela: number;
    percentualGerente: number;
    cartelas: CriarRegraCartelaDto[];
    paraTodasOticas?: boolean;
    oticasAlvoIds?: string[];
}
