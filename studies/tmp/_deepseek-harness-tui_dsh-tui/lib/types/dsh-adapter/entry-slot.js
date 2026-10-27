/**
 * The hand-off between this package's entry and the runtime it mounts. On the
 * DSH kernel the slot is also published for the profile's `dsh-tui` row in the
 * same Cordis root: the row then runs only the DSH side through `attachDsh`
 * (without a published slot it takes its usual path). On `globalThis` +
 * `Symbol.for` so a row loaded from another copy of this package still meets
 * the entry. Other kernels keep it private: the entry composes the light profile.
 */
const ENTRY_SLOT_KEY = Symbol.for('@deepseek-harness-tui/dsh-tui:host-entry');
/** The entry's slot, published for the `dsh-tui` row on the DSH kernel. */
export function createEntrySlot(dsh, kernelVersion) {
    const slot = { dsh, rowSeen: false, kernelVersion };
    if (dsh)
        globalThis[ENTRY_SLOT_KEY] = slot;
    return slot;
}
/** The published slot, if this process's entry mounted the screen. */
export function peekEntrySlot() {
    return globalThis[ENTRY_SLOT_KEY];
}
/** Take the DSH-side hook once: a second row (or a recompose) finds none. */
export function takeEntryAttach() {
    const slot = peekEntrySlot();
    const attach = slot?.attachDsh;
    if (slot !== undefined)
        slot.attachDsh = undefined;
    return attach;
}
