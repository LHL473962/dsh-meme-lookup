export interface ArtifactRef {
    artifactId: string;
    jobId: string;
    fileName: string;
    category: 'excel-export';
    sha256: string;
    size: number;
}
export declare class ArtifactRegistry {
    private readonly artifacts;
    validateSavePath(inputPath: string): {
        ok: true;
        canonicalPath: string;
    } | {
        ok: false;
        errorMessage: string;
    };
    registerArtifact(jobId: string, filePath: string, outputRoot: string): ArtifactRef;
    listArtifacts(jobId: string): ArtifactRef[];
    readArtifact(artifactId: string, jobId: string): {
        ok: true;
        content: Buffer;
        fileName: string;
    } | {
        ok: false;
    };
}
