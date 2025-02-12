import OSC from "osc-js";

type OscCallback = (oscMessage: OSC.Message) => void;

export abstract class TuioReceiver {

    private _isConnected: boolean;
    private _messageListeners: Map<string, OscCallback[]>;

    constructor() {
        this._isConnected = false;
        this._messageListeners = new Map();
    }

    public abstract connect(): void;

    public abstract disconnect(): void;

    public onOscMessage(oscMessage: OSC.Message) {
        const messageListeners = this._messageListeners.get(oscMessage.address);
        if (messageListeners !== undefined) {
            for (let messageListener of messageListeners) {
                messageListener(oscMessage);
            }
        }
    }

    public addMessageListener(address: string, callback: OscCallback) {
        if (!this._messageListeners.has(address)) {
            this._messageListeners.set(address, []);
        }
        this._messageListeners.get(address)?.push(callback);
    }
}
