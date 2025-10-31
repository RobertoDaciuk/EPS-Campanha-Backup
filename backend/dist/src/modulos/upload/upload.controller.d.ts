import { ArmazenamentoService } from './armazenamento.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class UploadController {
    private readonly armazenamentoService;
    private readonly prisma;
    constructor(armazenamentoService: ArmazenamentoService, prisma: PrismaService);
    uploadAvatar(file: Express.Multer.File, req: any): Promise<{
        avatarUrl: string;
    }>;
}
