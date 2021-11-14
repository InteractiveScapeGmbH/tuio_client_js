export class TuioReceiver {
    constructor() {
        this._isConnected = false;
        this._messageListeners = {};
    }

    connect(){
    }

    disconnect(){
    }

    onOscMessage(oscMessage){
        let messageListeners = this._messageListeners[oscMessage.address];
        if(messageListeners !== undefined){
            for (let messageListener of messageListeners){
                messageListener(oscMessage);
            }
        }
    }

    addMessageListener(address, callback){
        if(!(address in this._messageListeners)){
            this._messageListeners[address] = [];
        }
        this._messageListeners[address].push(callback);
    }
}
