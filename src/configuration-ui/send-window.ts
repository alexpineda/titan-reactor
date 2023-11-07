import { GlobalEvents } from "@core/global-events";

export function sendWindow<T extends keyof GlobalEvents>(
    type: T,
    payload: GlobalEvents[T]
) {
    window.opener.postMessage( { type, payload }, "*" );
}
