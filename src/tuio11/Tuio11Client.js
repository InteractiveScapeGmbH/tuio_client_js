import {Tuio11Object} from "./Tuio11Object.js";
import {Tuio11Cursor} from "./Tuio11Cursor.js";
import {Tuio11Blob} from "./Tuio11Blob.js";
import {TuioTime} from "../common/TuioTime.js";

export class Tuio11Client {
    constructor(tuioReceiver) {
        this._tuioReceiver = tuioReceiver;
        this._tuioReceiver.addMessageListener("/tuio/2Dobj", this._on2Dobj.bind(this));
        this._tuioReceiver.addMessageListener("/tuio/2Dcur", this._on2Dcur.bind(this));
        this._tuioReceiver.addMessageListener("/tuio/2Dblb", this._on2Dblb.bind(this));
        this._tuioListeners = [];

        this._tuioObjects = new Map();
        this._tuioCursors = new Map();
        this._tuioBlobs = new Map();

        this._objectSetMessages = [];
        this._cursorSetMessages = [];
        this._blobSetMessages = [];

        this._objectAliveMessage = null;
        this._cursorAliveMessage = null;
        this._blobAliveMessage = null;

        this._freeCursorIds = [];
        this._freeBlobIds = [];

        this._currentFrame = 0;
        this._currentTime = null;
    }

    connect() {
        TuioTime.init();
        this._currentTime = TuioTime.getCurrentTime();
        this._tuioReceiver.connect();
    }

    disconnect() {
        this._tuioReceiver.disconnect();
    }

    addTuioListener(tuioListener){
        this._tuioListeners.push(tuioListener);
    }

    removeTuioListener(tuioListener){
        let index = this._tuioListeners.indexOf(tuioListener);
        if(index > -1) {
            this._tuioListeners.splice(index, 1);
        }
    }

    removeAllTuioListeners(){
        this._tuioListeners = [];
    }

    getTuioObjects(){
        return this._tuioObjects.values();
    }

    getTuioCursors(){
        return this._tuioCursors.values();
    }

    getTuioBlobs(){
        return this._tuioBlobs.values();
    }

    getTuioObject(sessionId){
        let ret = this._tuioObjects.get(sessionId);
        return ret === undefined ? null : ret;
    }

    getTuioCursor(sessionId){
        let ret = this._tuioCursors.get(sessionId);
        return ret === undefined ? null : ret;
    }

    getTuioBlob(sessionId){
        let ret = this._tuioBlobs.get(sessionId);
        return ret === undefined ? null : ret;
    }

    _updateFrame(fseq){
        let currentTime = TuioTime.getCurrentTime();

        if(fseq > 0){
            if(fseq > this._currentFrame){
                this._currentTime = currentTime;
            }
            if(fseq >= this._currentFrame || (this._currentFrame - fseq) > 100){
                this._currentFrame = fseq;
            } else {
                return false;
            }
        } else if (currentTime.subtract(this._currentTime).getTotalMilliseconds() > 100) {
            this._currentTime = currentTime;
        }
        return true;
    }

    _on2Dobj(oscMessage){
        let command = oscMessage.args[0].value;
        if(command === "set") {
            this._objectSetMessages.push(oscMessage);
        } else if (command === "alive") {
            this._objectAliveMessage = oscMessage;
        } else if (command === "fseq") {
            let fseq = oscMessage.args[1].value;
            if(this._updateFrame(fseq)){
                if(this._objectAliveMessage !== null){
                    let currentSessionIds = new Set(this._tuioObjects.keys());
                    let aliveSessionIds = new Set(this._objectAliveMessage.args.slice(1).map(arg => arg.value));
                    let removedSessionIds = new Set([...currentSessionIds].filter(x => !aliveSessionIds.has(x)));
                    for(let sessionId of removedSessionIds) {
                        let tuioObject = this._tuioObjects.get(sessionId);
                        tuioObject._remove(this._currentTime);
                        for(let tuioListener of this._tuioListeners) {
                            tuioListener.removeTuioObject(tuioObject);
                        }
                        this._tuioObjects.delete(sessionId);
                    }
                    for(let setMessage of this._objectSetMessages){
                        let [, s, i, x, y, a, X, Y, A, m, r] = setMessage.args.map(arg => arg.value);
                        if(aliveSessionIds.has(s)){
                            if(currentSessionIds.has(s)){
                                let tuioObject = this._tuioObjects.get(s);
                                if(tuioObject._hasChanged(this._currentTime, x, y, a, X, Y, A, m, r)){
                                    tuioObject._update(this._currentTime, x, y, a, X, Y, A, m, r)
                                    for(let tuioListener of this._tuioListeners) {
                                        tuioListener.updateTuioObject(tuioObject);
                                    }
                                }
                            } else {
                                let tuioObject = new Tuio11Object(this._currentTime, s, i, x, y, a, X, Y, A, m, r);
                                this._tuioObjects.set(s, tuioObject);
                                for(let tuioListener of this._tuioListeners) {
                                    tuioListener.addTuioObject(tuioObject);
                                }
                            }
                        }
                    }
                    for(let tuioListener of this._tuioListeners) {
                        tuioListener.refresh(this._currentTime);
                    }
                }
                this._objectSetMessages = [];
                this._objectAliveMessage = null;
            }
        }
    }

    _on2Dcur(oscMessage){
        let command = oscMessage.args[0].value;
        if(command === "set") {
            this._cursorSetMessages.push(oscMessage);
        } else if (command === "alive") {
            this._cursorAliveMessage = oscMessage;
        } else if (command === "fseq") {
            let fseq = oscMessage.args[1].value;
            if(this._updateFrame(fseq)){
                if(this._cursorAliveMessage !== null){
                    let currentSessionIds = new Set(this._tuioCursors.keys());
                    let aliveSessionIds = new Set(this._cursorAliveMessage.args.slice(1).map(arg => arg.value));
                    let removedSessionIds = new Set([...currentSessionIds].filter(x => !aliveSessionIds.has(x)));
                    for(let sessionId of removedSessionIds) {
                        let tuioCursor = this._tuioCursors.get(sessionId);
                        tuioCursor._remove(this._currentTime);
                        for(let tuioListener of this._tuioListeners) {
                            tuioListener.removeTuioCursor(tuioCursor);
                        }
                        this._tuioCursors.delete(sessionId);
                        this._freeCursorIds.push(tuioCursor.cursorId);
                    }
                    this._freeCursorIds.sort();
                    for(let setMessage of this._cursorSetMessages) {
                        let [, s, x, y, X, Y, m] = setMessage.args.map(arg => arg.value);
                        if(aliveSessionIds.has(s)){
                            if(currentSessionIds.has(s)){
                                let tuioCursor = this._tuioCursors.get(s);
                                if(tuioCursor._hasChanged(this._currentTime, x, y, X, Y, m)){
                                    tuioCursor._update(this._currentTime, x, y, X, Y, m);
                                    for(let tuioListener of this._tuioListeners) {
                                        tuioListener.updateTuioCursor(tuioCursor);
                                    }
                                }
                            } else {
                                let cursorId = this._tuioCursors.size;
                                if (this._freeCursorIds.length > 0)
                                {
                                    cursorId = this._freeCursorIds[0];
                                    this._freeCursorIds.splice(0, 1);
                                }
                                let tuioCursor = new Tuio11Cursor(this._currentTime, s, cursorId, x, y, X, Y, m);
                                this._tuioCursors.set(s, tuioCursor);
                                for(let tuioListener of this._tuioListeners) {
                                    tuioListener.addTuioCursor(tuioCursor);
                                }
                            }
                        }
                    }
                    for(let tuioListener of this._tuioListeners) {
                        tuioListener.refresh(this._currentTime);
                    }
                }
                this._cursorSetMessages = [];
                this._cursorAliveMessage = null;
            }
        }
    }

    _on2Dblb(oscMessage){
        let command = oscMessage.args[0].value;
        if(command === "set") {
            this._blobSetMessages.push(oscMessage);
        } else if (command === "alive") {
            this._blobAliveMessage = oscMessage;
        } else if (command === "fseq") {
            let fseq = oscMessage.args[1].value;
            if(this._updateFrame(fseq)){
                if(this._blobAliveMessage !== null){
                    let currentSessionIds = new Set(this._tuioBlobs.keys());
                    let aliveSessionIds = new Set(this._blobAliveMessage.args.slice(1).map(arg => arg.value));
                    let removedSessionIds = new Set([...currentSessionIds].filter(x => !aliveSessionIds.has(x)));
                    for(let sessionId of removedSessionIds) {
                        let tuioBlob = this._tuioBlobs.get(sessionId);
                        tuioBlob._remove(this._currentTime);
                        for(let tuioListener of this._tuioListeners) {
                            tuioListener.removeTuioBlob(tuioBlob);
                        }
                        this._tuioBlobs.delete(sessionId);
                        this._freeBlobIds.push(tuioBlob.blobId);
                    }
                    this._freeBlobIds.sort();
                    for(let setMessage of this._blobSetMessages) {
                        let [, s, x, y, a, w, h, f, X, Y, A, m, r] = setMessage.args.map(arg => arg.value);
                        if(aliveSessionIds.has(s)){
                            if(currentSessionIds.has(s)){
                                let tuioBlob = this._tuioBlobs.get(s);
                                if(tuioBlob._hasChanged(this._currentTime, x, y, a, w, h, f, X, Y, A, m, r)){
                                    tuioBlob._update(this._currentTime, x, y, a, w, h, f, X, Y, A, m, r);
                                    for(let tuioListener of this._tuioListeners) {
                                        tuioListener.updateTuioBlob(tuioBlob);
                                    }
                                }
                            } else {
                                let blobId =this. _tuioBlobs.size;
                                if (this._freeBlobIds.length > 0)
                                {
                                    blobId = this._freeBlobIds[0];
                                    this._freeBlobIds.splice(0, 1);
                                }
                                let tuioBlob = new Tuio11Blob(this._currentTime, s, blobId, x, y, a, w, h, f, X, Y, A, m, r);
                                this._tuioBlobs.set(s, tuioBlob);
                                for(let tuioListener of this._tuioListeners) {
                                    tuioListener.addTuioBlob(tuioBlob);
                                }
                            }
                        }
                    }
                    for(let tuioListener of this._tuioListeners) {
                        tuioListener.refresh(this._currentTime);
                    }
                }
                this._blobSetMessages = [];
                this._blobAliveMessage = null;
            }
        }
    }
}