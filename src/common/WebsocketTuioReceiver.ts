import OSC from "osc-js";
import { TuioReceiver } from "./TuioReceiver.js";

export class WebsocketTuioReceiver extends TuioReceiver {
    private _url: string;
    private _websocket: WebSocket | null = null;
    constructor(url: string) {
        super();
        this._url = url;
    }

    public connect() {
        this._websocket = new WebSocket(this._url);
        this._websocket.onmessage = (event: MessageEvent) => this.processMessages(event);
        this.isConnected = true;
    }

    private async processMessages(event: MessageEvent) {
        const bundle = new OSC.Bundle();
        const dataview = new DataView(await event.data.arrayBuffer());
        bundle.unpack(dataview);
        bundle.bundleElements.forEach((oscmessage) => {
            this.onOscMessage(oscmessage);
        });
    }

    public disconnect() {
        this._websocket?.close();
        this.isConnected = false;
    }
}

