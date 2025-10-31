"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtualizarUsuarioDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const criar_usuario_admin_dto_1 = require("./criar-usuario-admin.dto");
class AtualizarUsuarioDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(criar_usuario_admin_dto_1.CriarUsuarioAdminDto, ['senha'])) {
}
exports.AtualizarUsuarioDto = AtualizarUsuarioDto;
//# sourceMappingURL=atualizar-usuario.dto.js.map