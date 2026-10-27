import type { ImageLimitsView } from '../../../agent/capabilities.js';
import type { ImageRef } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { UserInput } from '../protocol/index.js';
export declare const CODEX_IMAGE_LIMITS: ImageLimitsView;
/** Read and recheck staged facades before any turn/steer request is sent. */
export declare function codexImageInputs(images: readonly ImageRef[], limits?: ImageLimitsView): Promise<UserInput[]>;
/** No network fetches: only embedded supported-image data URLs are facades. */
export declare function dataUrlImageFacade(id: string, url: string): ImageRef | undefined;
/** Lazy local file view. A missing historical path still has a placeholder
 * facade; read rejects normally, letting the shared preview show unavailable. */
export declare function pathImageFacade(id: string, path: string, cwd: string): ImageRef;
/** userMessage.content image/localImage blocks, in their durable order. */
export declare function transcriptImages(content: unknown, idPrefix: string, cwd: string): ImageRef[];
/** Native viewed/generated images. savedPath wins without decoding result. */
export declare function itemImages(item: Rec, idPrefix: string, cwd: string): ImageRef[];
//# sourceMappingURL=images.d.ts.map