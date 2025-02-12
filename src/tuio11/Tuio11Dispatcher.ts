import { TuioDispatcher } from "../common/TuioDispatcher";
import { WebsocketReceiver } from "../common/WebsocketReceiver";
import { Tuio11Processor } from "./Tuio11Processor";

export class Tuio11Dispatcher implements TuioDispatcher {

    private processor: Tuio11Processor | null = null;

    setupProcessor(receiver: WebsocketReceiver): void {
        this.processor = new Tuio11Processor(receiver);
    }
    registerCallbacks(): void {
        if (!this.processor) return;

    }
    unregisterCallbacks(): void {
        if (!this.processor) return;

    }

}