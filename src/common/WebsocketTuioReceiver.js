import {TuioReceiver} from "./TuioReceiver.js";

export class WebsocketTuioReceiver extends TuioReceiver {
    constructor(url, reconnect=true) {
        super();
        this._url = url
        this._reconnect = reconnect;
    }

    connect(){
        if (this.isConnected()) {
            return;
        }
        if (this._oscPort && this._oscPort.socket && this._oscPort.socket.readyState === 0) {
            this.disconnect()
            window.setTimeout(this.connect.bind(this), 1000)
            return;
        }
        this._oscPort = new osc.WebSocketPort({
            url: this._url,
            metadata: true
        });
        this._oscPort.open();
        if (this._reconnect && ! this.isConnected()) {
            window.setTimeout(this.connect.bind(this), 5000)
        }
        this._oscPort.on("message", function(oscMessage) {
            this.onOscMessage(oscMessage);
        }.bind(this));
        this._oscPort.on("close", function(error) {
            console.log("closed:", this, "message:", error)
            this.connect()
        }.bind(this));
    }

    disconnect(){
        if (this._oscPort) this._oscPort.close();
    }

    isConnected() {
        return this._oscPort && this._oscPort.socket && this._oscPort.socket.readyState === 1
    }
}

