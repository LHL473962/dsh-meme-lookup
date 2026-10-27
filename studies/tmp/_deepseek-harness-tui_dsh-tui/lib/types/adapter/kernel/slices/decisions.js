import { decisionsDriver } from '../../upstream/decisions-driver.js';
export const decisionsSlice = Object.freeze({
    id: 'decisions',
    capability: 'host.decisions',
    driver: decisionsDriver,
    standardDeclarations: Object.freeze([
        'host.decision.subscribe',
        'host.decision.probe',
    ]),
});
