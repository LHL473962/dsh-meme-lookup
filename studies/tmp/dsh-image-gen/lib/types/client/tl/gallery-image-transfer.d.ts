import type { GalleryItem } from '../gallery-store.js';
import type { TlLandingItem } from './tl-canvas-bridge.js';
export declare const GALLERY_IMAGE_MIME = "application/x-dsh-image-gen-gallery-image";
type DragStart = {
    dataTransfer: DataTransfer | null;
    preventDefault(): void;
};
export declare function galleryLanding(item: GalleryItem): TlLandingItem;
/** A real file also works when the host drops custom MIME data between containers. */
export declare function startGalleryImageDrag(event: DragStart, item: GalleryItem, blob: Blob | null | undefined): boolean;
export declare function readGalleryImageDrop(transfer: Pick<DataTransfer, 'getData'>): TlLandingItem | undefined;
export {};
