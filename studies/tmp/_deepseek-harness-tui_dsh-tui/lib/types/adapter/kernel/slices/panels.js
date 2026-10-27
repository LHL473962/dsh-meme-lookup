import { panelsDriver } from '../../upstream/panels-driver.js';
export const panelsSlice = Object.freeze({
    id: 'panels',
    capability: 'host.panels',
    driver: panelsDriver,
    standardDeclarations: Object.freeze([
        'host.panels.register',
        'host.panels.list',
        'host.panels.open',
        'host.panels.close',
        'host.panels.badge',
        'host.panels.subscribe',
    ]),
});
