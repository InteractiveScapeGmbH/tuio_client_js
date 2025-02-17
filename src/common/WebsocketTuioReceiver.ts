import OSC from "osc-js";
import { TuioReceiver } from "./TuioReceiver.js";

export class WebsocketTuioReceiver extends TuioReceiver {
    private readonly _host: string;
    private readonly _port: number;
    private _osc: OSC;
    constructor(host: string, port: number) {
        super();
        this._host = host;
        this._port = port;
        const plugin = new OSC.WebsocketClientPlugin({host: this._host, port: this._port});
        this._osc = new OSC({plugin: plugin});
        this._osc.on("*", (message: OSC.Message) => this.onOscMessage(message));
    }

    public connect() {
        this._osc.open();
        this.isConnected = true;
    }

    public disconnect() {
        this._osc.close();
        this.isConnected = false;
    }
}

