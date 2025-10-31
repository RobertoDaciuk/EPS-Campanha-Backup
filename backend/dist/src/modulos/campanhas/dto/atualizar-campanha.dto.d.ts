import { CriarCampanhaDto } from './criar-campanha.dto';
declare const AtualizarCampanhaDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CriarCampanhaDto, "cartelas" | "oticasAlvoIds">>>;
export declare class AtualizarCampanhaDto extends AtualizarCampanhaDto_base {
    paraTodasOticas?: boolean;
}
export {};
