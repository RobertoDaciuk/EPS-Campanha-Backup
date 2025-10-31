import { CriarUsuarioAdminDto } from './criar-usuario-admin.dto';
declare const AtualizarUsuarioDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CriarUsuarioAdminDto, "senha">>>;
export declare class AtualizarUsuarioDto extends AtualizarUsuarioDto_base {
}
export {};
