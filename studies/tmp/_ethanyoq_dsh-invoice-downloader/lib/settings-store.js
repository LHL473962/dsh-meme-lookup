import * as fs from 'node:fs';
import * as path from 'node:path';
const DEFAULT_SETTINGS = {
    email: '',
    dateFrom: '',
    dateTo: '',
    company: '',
    savePath: '',
    ocrProvider: 'local',
};
function settingsPath(profileDir) {
    return path.join(profileDir, 'settings.json');
}
export function readSettings(profileDir) {
    try {
        const value = JSON.parse(fs.readFileSync(settingsPath(profileDir), 'utf8'));
        return {
            email: typeof value.email === 'string' ? value.email : '',
            dateFrom: typeof value.dateFrom === 'string' ? value.dateFrom : '',
            dateTo: typeof value.dateTo === 'string' ? value.dateTo : '',
            company: typeof value.company === 'string' ? value.company : '',
            savePath: typeof value.savePath === 'string' ? value.savePath : '',
            ocrProvider: value.ocrProvider === 'glm' ? 'glm' : 'local',
        };
    }
    catch {
        return { ...DEFAULT_SETTINGS };
    }
}
export function writeSettings(profileDir, settings) {
    fs.mkdirSync(profileDir, { recursive: true });
    fs.writeFileSync(settingsPath(profileDir), `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
}
