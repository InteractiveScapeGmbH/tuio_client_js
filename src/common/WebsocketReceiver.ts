import OSC from "osc-js"

interface MessageListener {
    profile: string,
    callback: OscCallback
}


type OscCallback = (data: OSC.Message) => void;

export class WebsocketReceiver {
    private ws: WebSocket;
    private messageListeners: Map<string, OscCallback[]>;
    constructor(host: string, port: number) {
        this.messageListeners = new Map();
        this.ws = new WebSocket("ws://127.0.0.1:3333");
        this.ws.onmessage = async (event) => {
            let msg = new OSC.Bundle();
            const arr = new DataView(await event.data.arrayBuffer());
            msg.unpack(arr);
            // console.log(msg.bundleElements[2].address);
        }
    }


    public addMessageListener(listener: MessageListener) {
        const profile = listener.profile;
        if (!this.messageListeners.has(profile)) {
            this.messageListeners.set(profile, new Array<OscCallback>());
        }
        this.messageListeners.get(profile)?.push(listener.callback);
    }


}