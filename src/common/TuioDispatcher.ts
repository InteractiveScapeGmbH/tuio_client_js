import { WebsocketReceiver } from "./WebsocketReceiver";

export interface TuioDispatcher {
    setupProcessor(receiver: WebsocketReceiver): void;
    registerCallbacks(): void;
    unregisterCallbacks(): void;
}