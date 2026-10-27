import { fileUrlToPath, parseFileLinkUrl } from './fileTarget.js';
const EXTERNAL_SCHEME = /^https?:\/\//i;
/**
 * Classify a clicked link target. Mirrors the previous handleOpenTarget
 * dispatch order (dsh-file: and file: keep going through the file-action
 * menu), with the final fall-through narrowed from "open anything" to
 * "open http(s) only".
 * @param url - the clicked link target.
 * @returns the action the click handler should take.
 */
export function classifyOpenTarget(url) {
    const fileLink = parseFileLinkUrl(url);
    if (fileLink !== undefined)
        return { kind: 'file-actions', path: fileLink };
    const filePath = fileUrlToPath(url);
    if (filePath !== undefined)
        return { kind: 'file-actions', path: filePath };
    if (EXTERNAL_SCHEME.test(url))
        return { kind: 'external' };
    return { kind: 'rejected' };
}
