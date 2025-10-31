"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Papeis = exports.PAPEIS_CHAVE = void 0;
const common_1 = require("@nestjs/common");
exports.PAPEIS_CHAVE = 'papeis';
const Papeis = (...papeis) => (0, common_1.SetMetadata)(exports.PAPEIS_CHAVE, papeis);
exports.Papeis = Papeis;
//# sourceMappingURL=papeis.decorator.js.map