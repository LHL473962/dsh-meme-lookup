/** Token-based context-window styles embedded into the independently distributed client bundle. */
export declare const novelContextCss: string;
/**
 * Install this plugin's context-window styles for one client fiber.
 *
 * @param target Browser document receiving the owned style element.
 * @returns A disposer that removes only this plugin's style element.
 */
export declare function installNovelContextStyle(target: Document): () => void;
