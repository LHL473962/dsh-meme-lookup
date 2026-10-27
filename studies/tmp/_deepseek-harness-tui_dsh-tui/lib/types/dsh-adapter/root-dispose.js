const compositions = new WeakMap();
/** A root dispose waits for `settle` first. */
export function trackComposition(root, settle) {
    const key = root.root;
    const composition = { settle, disposing: false };
    compositions.set(key, composition);
    return {
        get disposing() { return composition.disposing; },
        done() {
            if (compositions.get(key) === composition)
                compositions.delete(key);
        },
    };
}
/** Dispose the root once a composition in progress on it has let its Loader settle. */
export async function disposeRootSettled(ctx, dispose = () => ctx.root.fiber.dispose()) {
    const composition = compositions.get(ctx.root);
    if (composition !== undefined) {
        composition.disposing = true;
        try {
            await composition.settle();
        }
        catch {
            // A failed activation is the composition's to report; dispose anyway.
        }
    }
    return dispose();
}
