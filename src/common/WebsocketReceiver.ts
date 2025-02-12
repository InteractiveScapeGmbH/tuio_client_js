import OSC from "osc-js"
import { OscCallback, MessageListener } from "./MessageListener";

export class WebsocketReceiver {
    private ws: WebSocket | null = null;
    private host: string;
    private port: number;
    private messageListeners: Map<string, OscCallback[]> = new Map();

    constructor(host: string, port: number) {

        this.host = host;
        this.port = port;
    }

    public connect() {
        const url = `ws://${this.host}:${this.port}`
        this.ws = new WebSocket(url);
        this.ws.onmessage = (event: MessageEvent) => this.processMessages(event);
    }

    public disconnect() {
        this.ws?.close();
    }


    private async processMessages(event: MessageEvent): Promise<void> {
        const bundle = new OSC.Bundle();
        const dataview = new DataView(await event.data.arrayBuffer());
        bundle.unpack(dataview);
        bundle.bundleElements.forEach((oscmessage) => {
            if (this.messageListeners.has(oscmessage.address)) {
                const callbacks = this.messageListeners.get(oscmessage.address);
                callbacks?.forEach((callback) => {
                    callback(oscmessage);
                });
            }
        });
    }

    public addMessageListeners(listeners: MessageListener[]) {
        listeners.forEach((listener) => {
            this.addMessageListener(listener);
        });
    }


    public addMessageListener(listener: MessageListener) {
        const profile = listener.profile;
        if (!this.messageListeners.has(profile)) {
            this.messageListeners.set(profile, new Array<OscCallback>());
        }
        this.messageListeners.get(profile)?.push(listener.callback);
    }

    public removeMessageListener(messageProfile: string) {
        if (this.messageListeners.has(messageProfile)) {
            this.messageListeners.delete(messageProfile);
        }
    }
}