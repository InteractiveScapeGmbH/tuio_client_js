import {TuioReceiver} from "./TuioReceiver.js";

export class WebsocketTuioReceiver extends TuioReceiver {
    constructor(url) {
        super();
        this._oscPort = new osc.WebSocketPort({
            url: url,
            metadata: true
        });
    }

    connect(){
        this._oscPort.open();
        this._isConnected = true;
        this._oscPort.on("message", function(oscMessage) {
            this.onOscMessage(oscMessage);
        }.bind(this));
    }

    disconnect(){
        this._oscPort.close();
        this._isConnected = false;
    }
}

