export { classifyDshEvent, createOpenPetsDshClient, createOpenPetsDshRuntime, registerDshListeners, } from "./runtime.js";
import { registerDshListeners } from "./runtime.js";
export const name = "@open-pets/dsh";
/** Install the OpenPets listeners into the DSH Cordis context. */
export function apply(ctx, config = {}) {
    if (config.enabled === false)
        return;
    registerDshListeners(ctx, config);
}
//# sourceMappingURL=index.js.map