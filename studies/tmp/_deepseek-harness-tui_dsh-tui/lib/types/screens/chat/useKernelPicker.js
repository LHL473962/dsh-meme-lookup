import React from 'react';
import { buildKernelCatalog } from '../../components/kernelCatalog.js';
import { WORKING_GATE_NOTICES } from '../../commands.js';
import { t } from '../../i18n.js';
export function useKernelPicker({ channel, kernelVersion, kernelEntries, launchpadShown, onProbeKernels, onSwitchBackend, canInstallSdk, dispatchOverlay }) {
    const currentId = channel.backendCapabilities?.backendId ?? 'dsh';
    const [probe, setProbe] = React.useState(undefined);
    const probeRequest = React.useRef(undefined);
    const pendingPick = React.useRef(0);
    React.useEffect(() => () => { pendingPick.current += 1; }, []);
    const requestProbe = React.useCallback(() => {
        if (probeRequest.current !== undefined || onProbeKernels === undefined)
            return probeRequest.current;
        probeRequest.current = onProbeKernels().catch(() => {
            // A failed probe leaves every optional backend "not installed" rather than
            // "checking" forever; dsh needs no status (it is always available).
            return Object.fromEntries(kernelEntries.map(entry => [entry.id, { installed: false }]));
        });
        void probeRequest.current.then(setProbe);
        return probeRequest.current;
    }, [onProbeKernels, kernelEntries]);
    /** Force a fresh probe (the once-guard stays for the automatic paths): the
     *  SDK install wizard calls this after a successful install so the dim
     *  row lights up without a process restart. */
    const reprobe = React.useCallback(() => {
        probeRequest.current = undefined;
        void requestProbe();
    }, [requestProbe]);
    const options = React.useMemo(() => buildKernelCatalog({
        current: currentId,
        entries: kernelEntries,
        ...(kernelVersion === undefined ? {} : { dshVersion: kernelVersion }),
        ...(probe === undefined ? {} : { statuses: probe }),
        canInstallSdk,
    }), [currentId, kernelEntries, kernelVersion, probe, canInstallSdk]);
    React.useEffect(() => {
        if (launchpadShown)
            void requestProbe();
    }, [launchpadShown, requestProbe]);
    const currentIndex = Math.max(0, options.findIndex(option => option.current));
    const open = React.useCallback((index) => {
        pendingPick.current += 1;
        void requestProbe();
        dispatchOverlay({ type: 'open', overlay: { kind: 'kernel', index: index ?? currentIndex } });
    }, [currentIndex, requestProbe, dispatchOverlay]);
    const pickOption = (option, wasWorking = channel.working) => {
        if (option === undefined) {
            channel.notify(t('kernel-switch-unavailable'), { color: 'warning' });
            return;
        }
        if (!option.selectable) {
            if (option.installable === true) {
                // The installable row opens the wizard instead of a dead-end toast;
                // the wizard owns its own keys (Enter/Esc) from here on. It carries the
                // row's id: the surface the wizard acts on is looked up per backend at
                // open time, not assumed (Stage B / §6 item 12).
                dispatchOverlay({
                    type: 'open',
                    overlay: {
                        kind: 'sdk-install',
                        backendId: option.id,
                        ...(option.hint === undefined ? {} : { foundCli: option.hint }),
                    },
                });
                return;
            }
            // Detection's own guidance (how to install or upgrade) beats the bare reason.
            channel.notify(option.hint ?? (option.reasonKey === undefined ? t('kernel-switch-unavailable') : t(option.reasonKey)), { color: 'warning' });
            return;
        }
        if (option.current) {
            dispatchOverlay({ type: 'close' });
            channel.notify(t('kernel-already-current'));
            return;
        }
        if (onSwitchBackend === undefined) {
            channel.notify(t('kernel-switch-unavailable'), { color: 'warning' });
            return;
        }
        if (wasWorking || channel.working) {
            channel.notify(t(WORKING_GATE_NOTICES.kernel), { color: 'warning' });
            return;
        }
        dispatchOverlay({ type: 'close' });
        onSwitchBackend(option.id);
    };
    const pick = (index) => {
        pendingPick.current += 1;
        if (options[index] !== undefined)
            pickOption(options[index]);
    };
    const pickById = async (id) => {
        const generation = ++pendingPick.current;
        const wasWorking = channel.working;
        let option = options.find(option => option.id === id);
        if (option?.reasonKey === 'kernel-probing') {
            const statuses = await requestProbe();
            // A newer pick, opening the picker, or unmounting cancels a waiting shortcut.
            if (generation !== pendingPick.current)
                return;
            option = buildKernelCatalog({
                current: channel.backendCapabilities?.backendId ?? 'dsh',
                entries: kernelEntries,
                dshVersion: kernelVersion,
                statuses,
                canInstallSdk,
            }).find(option => option.id === id);
        }
        pickOption(option, wasWorking);
    };
    return { currentId, options, open, pick, pickById, reprobe };
}
