export interface InvoiceSettings {
    email: string;
    dateFrom: string;
    dateTo: string;
    company: string;
    savePath: string;
    ocrProvider: 'local' | 'glm';
}
export declare function readSettings(profileDir: string): InvoiceSettings;
export declare function writeSettings(profileDir: string, settings: InvoiceSettings): void;
