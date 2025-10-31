export declare class ArmazenamentoService {
    private readonly logger;
    uploadArquivo(buffer: Buffer, mimetype: string, pastaDestino: string, nomeBaseArquivo: string): Promise<string>;
    uploadAvatar(fileBuffer: Buffer, mimetype: string, usuarioId: string): Promise<string>;
}
