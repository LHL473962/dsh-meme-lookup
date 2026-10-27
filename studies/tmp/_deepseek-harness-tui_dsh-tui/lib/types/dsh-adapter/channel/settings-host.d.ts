import type { ServiceLookup } from './channel-host.js';
import type { ChannelState } from '../channel/types.js';
import type { SettingsNamespaceView, TuiSettingsSection } from '../../adapter/ports/channel-settings.js';
/** Forms over the host's web settings; provider selection remains owned by DSH. */
export declare function webSettingsSections(ctx: ServiceLookup, namespaces: readonly SettingsNamespaceView[]): TuiSettingsSection[];
export declare function createSettingsHosts(ctx: ServiceLookup, assertActive?: () => void): Pick<ChannelState, 'settingsHost' | 'providerSetup' | 'oauthProviderStatuses' | 'backendAuth'>;
//# sourceMappingURL=settings-host.d.ts.map