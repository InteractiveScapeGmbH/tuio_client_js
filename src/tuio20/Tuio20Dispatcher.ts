import { TuioDispatcher } from "../common/TuioDispatcher";
import { WebsocketReceiver } from "../common/WebsocketReceiver";

export class Tuio20Dispatcher implements TuioDispatcher {
    setupProcessor(receiver: WebsocketReceiver): void {
        throw new Error("Method not implemented.");
    }
    registerCallbacks(): void {
        throw new Error("Method not implemented.");
    }
    unregisterCallbacks(): void {
        throw new Error("Method not implemented.");
    }

}