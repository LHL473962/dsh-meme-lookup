import { scenesDriver } from '../../upstream/scenes-driver.js';
export const scenesSlice = Object.freeze({
    id: 'scenes',
    capability: 'host.scenes',
    driver: scenesDriver,
    standardDeclarations: Object.freeze([
        'host.scenes.register',
        'host.scenes.list',
        'host.scenes.open',
        'host.scenes.close',
        'host.scenes.active',
        'host.scenes.subscribe',
    ]),
});
