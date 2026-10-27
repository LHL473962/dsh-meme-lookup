/**
 * The Ink app's exit handler and output stream.
 */
export type Props = {
    /** The output stream supplied to this app's render call. */
    readonly stdout: NodeJS.WriteStream;
    /**
     * Exit (unmount) the whole Ink app.
     */
    readonly exit: (error?: Error) => void;
};
/**
 * App-scoped services shared by the renderer and its descendants.
 */
declare const AppContext: import("react").Context<Props>;
export default AppContext;
//# sourceMappingURL=AppContext.d.ts.map