import { WebsocketReceiver } from "./WebsocketReceiver";

export class TuioClient {
    private receiver: WebsocketReceiver;

    constructor(host: string, port: number) {
        this.receiver = new WebsocketReceiver(host, port);

    }

    public connect() {
        // this.receiver.connect();
    }

    public disconnect() {
        // this.receiver.disconnect();
    }

    public AddMessageListener() {

    }

    public RemoveMessageListener() {

    }
}