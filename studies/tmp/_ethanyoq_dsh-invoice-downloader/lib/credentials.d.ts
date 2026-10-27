import type { CredentialProvider, CredentialRef } from '@deepseek-ai/dsh-credentials';
export declare const IMAP_AUTH_CODE_REF: CredentialRef;
export declare const GLM_API_KEY_REF: CredentialRef;
export declare function resolveCredential(service: CredentialProvider, ref: CredentialRef): Promise<string>;
export declare function isCredentialConfigured(service: CredentialProvider, ref: CredentialRef): Promise<boolean>;
