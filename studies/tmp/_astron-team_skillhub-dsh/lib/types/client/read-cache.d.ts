/** Read-only views may reuse data; write authorization is always checked separately. */
export declare const readCacheOptions: {
    readonly staleTime: 60000;
    readonly refetchOnWindowFocus: false;
    readonly refetchOnReconnect: false;
};
