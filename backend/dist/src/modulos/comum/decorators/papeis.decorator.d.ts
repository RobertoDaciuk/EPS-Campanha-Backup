import { PapelUsuario } from '@prisma/client';
export declare const PAPEIS_CHAVE = "papeis";
export declare const Papeis: (...papeis: PapelUsuario[]) => import("@nestjs/common").CustomDecorator<string>;
