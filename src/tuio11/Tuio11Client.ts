import { Tuio11Object } from "./Tuio11Object.js";
import { Tuio11Cursor } from "./Tuio11Cursor.js";
import { Tuio11Blob } from "./Tuio11Blob.js";
import { TuioTime } from "../common/TuioTime.js";
import { TuioReceiver } from "../common/TuioReceiver.js";
import OSC from "osc-js";
import { Vector } from "vecti";
import { Tuio11Listener } from "./Tuio11Listener.js";

export class Tuio11Client {

    private _tuioReceiver: TuioReceiver;
    private _currentTime: TuioTime;
    private _currentFrame: number;
    private _tuioObjects: Map<number, Tuio11Object>;
    private _tuioCursors: Map<number, Tuio11Cursor>;
    private _tuioBlobs: Map<number, Tuio11Blob>;
    private _objectSetMessages: OSC.Message[];
    private _cursorSetMessages: OSC.Message[];
    private _blobSetMessages: OSC.Message[];
    private _objectAliveMessage: OSC.Message | null;
    private _cursorAliveMessage: OSC.Message | null;
    private _blobAliveMessage: OSC.Message | null;
    private _freeCursorIds: number[];
    private _freeBlobIds: number[];
    private _tuioListeners: Tuio11Listener[];

    constructor(tuioReceiver: TuioReceiver) {
        this._tuioReceiver = tuioReceiver;
        this._tuioReceiver.addMessageListener("/tuio/2Dobj", this.on2Dobj.bind(this));
        this._tuioReceiver.addMessageListener("/tuio/2Dcur", this.on2Dcur.bind(this));
        this._tuioReceiver.addMessageListener("/tuio/2Dblb", this.on2Dblb.bind(this));
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
        this._currentTime = TuioTime.getCurrentTime();
    }

    public connect() {
        TuioTime.init();
        this._currentTime = TuioTime.getCurrentTime();
        this._tuioReceiver.connect();
    }

    public disconnect() {
        this._tuioReceiver.disconnect();
    }

    public addTuioListener(tuioListener: Tuio11Listener) {
        this._tuioListeners.push(tuioListener);
    }

    public removeTuioListener(tuioListener: Tuio11Listener) {
        let index = this._tuioListeners.indexOf(tuioListener);
        if (index > -1) {
            this._tuioListeners.splice(index, 1);
        }
    }

    public removeAllTuioListeners() {
        this._tuioListeners = [];
    }

    public getTuioObjects() {
        return this._tuioObjects.values();
    }

    public getTuioCursors() {
        return this._tuioCursors.values();
    }

    public getTuioBlobs() {
        return this._tuioBlobs.values();
    }

    public getTuioObject(sessionId: number) {
        let ret = this._tuioObjects.get(sessionId);
        return ret === undefined ? null : ret;
    }

    public getTuioCursor(sessionId: number) {
        let ret = this._tuioCursors.get(sessionId);
        return ret === undefined ? null : ret;
    }

    public getTuioBlob(sessionId: number) {
        let ret = this._tuioBlobs.get(sessionId);
        return ret === undefined ? null : ret;
    }

    private updateFrame(fseq: number) {
        let currentTime = TuioTime.getCurrentTime();

        if (fseq > 0) {
            if (fseq > this._currentFrame) {
                this._currentTime = currentTime;
            }
            if (fseq >= this._currentFrame || (this._currentFrame - fseq) > 100) {
                this._currentFrame = fseq;
            } else {
                return false;
            }
        } else if (currentTime.subtract(this._currentTime).getTotalMilliseconds() > 100) {
            this._currentTime = currentTime;
        }
        return true;
    }

    on2Dobj(oscMessage: OSC.Message) {
        let command = oscMessage.args[0];
        if (command === "set") {
            this._objectSetMessages.push(oscMessage);
        } else if (command === "alive") {
            this._objectAliveMessage = oscMessage;
        } else if (command === "fseq") {
            let fseq = Number(oscMessage.args[1]);
            if (this.updateFrame(fseq)) {
                if (this._objectAliveMessage !== null) {
                    let currentSessionIds = new Set(this._tuioObjects.keys());
                    let aliveSessionIds = new Set(this._objectAliveMessage.args.slice(1).map(arg => Number(arg)));
                    let removedSessionIds = new Set([...currentSessionIds].filter(x => !aliveSessionIds.has(x)));
                    for (let sessionId of removedSessionIds) {
                        let tuioObject = this._tuioObjects.get(sessionId);
                        if (tuioObject) {
                            tuioObject.remove(this._currentTime);
                            for (let tuioListener of this._tuioListeners) {
                                tuioListener.removeTuioObject(tuioObject);
                            }
                        }
                        this._tuioObjects.delete(sessionId);
                    }
                    for (let setMessage of this._objectSetMessages) {
                        const sessionId = Number(setMessage.args[1]);
                        const symbolId = Number(setMessage.args[2]);
                        const position = new Vector(Number(setMessage.args[3]), Number(setMessage.args[4]));
                        const angle = Number(setMessage.args[5])
                        const velocity = new Vector(Number(setMessage.args[6]), Number(setMessage.args[7]));
                        const rotationSpeed = Number(setMessage.args[8]);
                        const motionAccel = Number(setMessage.args[9]);
                        const rotationAccel = Number(setMessage.args[10]);
                        if (aliveSessionIds.has(sessionId)) {
                            if (currentSessionIds.has(sessionId)) {
                                let tuioObject = this._tuioObjects.get(sessionId);
                                if (tuioObject?.hasChanged(position, angle, velocity, rotationSpeed, motionAccel, rotationAccel)) {
                                    tuioObject?.update(this._currentTime, position, angle, velocity, rotationSpeed, motionAccel, rotationAccel)
                                    for (let tuioListener of this._tuioListeners) {
                                        tuioListener.updateTuioObject(tuioObject);
                                    }
                                }
                            } else {
                                let tuioObject = new Tuio11Object(this._currentTime, sessionId, symbolId, position, angle, velocity, rotationSpeed, motionAccel, rotationAccel);
                                this._tuioObjects.set(sessionId, tuioObject);
                                for (let tuioListener of this._tuioListeners) {
                                    tuioListener.addTuioObject(tuioObject);
                                }
                            }
                        }
                    }
                    for (let tuioListener of this._tuioListeners) {
                        tuioListener.refresh(this._currentTime);
                    }
                }
                this._objectSetMessages = [];
                this._objectAliveMessage = null;
            }
        }
    }

    on2Dcur(oscMessage: OSC.Message) {
        let command = oscMessage.args[0];
        if (command === "set") {
            this._cursorSetMessages.push(oscMessage);
        } else if (command === "alive") {
            this._cursorAliveMessage = oscMessage;
        } else if (command === "fseq") {
            let fseq = Number(oscMessage.args[1]);
            if (this.updateFrame(fseq)) {
                if (this._cursorAliveMessage !== null) {
                    let currentSessionIds = new Set(this._tuioCursors.keys());
                    let aliveSessionIds = new Set(this._cursorAliveMessage.args.slice(1).map(arg => Number(arg)));
                    let removedSessionIds = new Set([...currentSessionIds].filter(x => !aliveSessionIds.has(x)));
                    for (let sessionId of removedSessionIds) {
                        let tuioCursor = this._tuioCursors.get(sessionId);
                        if (tuioCursor) {
                            tuioCursor.remove(this._currentTime);
                            for (let tuioListener of this._tuioListeners) {
                                tuioListener.removeTuioCursor(tuioCursor);
                            }
                            this._tuioCursors.delete(sessionId);
                            this._freeCursorIds.push(tuioCursor.cursorId);
                        }
                    }
                    this._freeCursorIds.sort();
                    for (let setMessage of this._cursorSetMessages) {
                        const sessionId = Number(setMessage.args[1]);
                        const position = new Vector(Number(setMessage.args[2]), Number(setMessage.args[3]));
                        const velocity = new Vector(Number(setMessage.args[4]), Number(setMessage.args[5]));
                        const motionAccel = Number(setMessage.args[6]);
                        if (aliveSessionIds.has(sessionId)) {
                            if (currentSessionIds.has(sessionId)) {
                                let tuioCursor = this._tuioCursors.get(sessionId);
                                if (tuioCursor?.hasChanged(position, velocity, motionAccel)) {
                                    tuioCursor?.update(this._currentTime, position, velocity, motionAccel);
                                    for (let tuioListener of this._tuioListeners) {
                                        tuioListener.updateTuioCursor(tuioCursor);
                                    }
                                }
                            } else {
                                let cursorId = this._tuioCursors.size;
                                if (this._freeCursorIds.length > 0) {
                                    cursorId = this._freeCursorIds[0];
                                    this._freeCursorIds.splice(0, 1);
                                }
                                let tuioCursor = new Tuio11Cursor(this._currentTime, sessionId, cursorId, position, velocity, motionAccel);
                                this._tuioCursors.set(sessionId, tuioCursor);
                                for (let tuioListener of this._tuioListeners) {
                                    tuioListener.addTuioCursor(tuioCursor);
                                }
                            }
                        }
                    }
                    for (let tuioListener of this._tuioListeners) {
                        tuioListener.refresh(this._currentTime);
                    }
                }
                this._cursorSetMessages = [];
                this._cursorAliveMessage = null;
            }
        }
    }

    on2Dblb(oscMessage: OSC.Message) {
        let command = oscMessage.args[0];
        if (command === "set") {
            this._blobSetMessages.push(oscMessage);
        } else if (command === "alive") {
            this._blobAliveMessage = oscMessage;
        } else if (command === "fseq") {
            let fseq = Number(oscMessage.args[1]);
            if (this.updateFrame(fseq)) {
                if (this._blobAliveMessage !== null) {
                    let currentSessionIds = new Set(this._tuioBlobs.keys());
                    let aliveSessionIds = new Set(this._blobAliveMessage.args.slice(1).map(arg => Number(arg)));
                    let removedSessionIds = new Set([...currentSessionIds].filter(x => !aliveSessionIds.has(x)));
                    for (let sessionId of removedSessionIds) {
                        let tuioBlob = this._tuioBlobs.get(sessionId);
                        if (tuioBlob) {
                            tuioBlob.remove(this._currentTime);
                            for (let tuioListener of this._tuioListeners) {
                                tuioListener.removeTuioBlob(tuioBlob);
                            }
                            this._tuioBlobs.delete(sessionId);
                            this._freeBlobIds.push(tuioBlob.blobId);
                        }
                    }
                    this._freeBlobIds.sort();
                    for (let setMessage of this._blobSetMessages) {
                        const sessionId = Number(setMessage.args[1]);
                        const position = new Vector(Number(setMessage.args[2]), Number(setMessage.args[3]));
                        const angle = Number(setMessage.args[4]);
                        const size = new Vector(Number(setMessage.args[5]), Number(setMessage.args[6]));
                        const area = Number(setMessage.args[7]);
                        const velocity = new Vector(Number(setMessage.args[8]), Number(setMessage.args[9]));
                        const rotationSpeed = Number(setMessage.args[10]);
                        const motionAccel = Number(setMessage.args[11]);
                        const rotationAccel = Number(setMessage.args[12])
                        if (aliveSessionIds.has(sessionId)) {
                            if (currentSessionIds.has(sessionId)) {
                                let tuioBlob = this._tuioBlobs.get(sessionId);
                                if (tuioBlob?.hasChanged(position, angle, size, area, velocity, rotationSpeed, motionAccel, rotationAccel)) {
                                    tuioBlob?.update(this._currentTime, position, angle, size, area, velocity, rotationSpeed, motionAccel, rotationAccel);
                                    for (let tuioListener of this._tuioListeners) {
                                        tuioListener.updateTuioBlob(tuioBlob);
                                    }
                                }
                            } else {
                                let blobId = this._tuioBlobs.size;
                                if (this._freeBlobIds.length > 0) {
                                    blobId = this._freeBlobIds[0];
                                    this._freeBlobIds.splice(0, 1);
                                }
                                let tuioBlob = new Tuio11Blob(this._currentTime, sessionId, blobId, position, angle, size, area, velocity, rotationSpeed, motionAccel, rotationAccel);
                                this._tuioBlobs.set(sessionId, tuioBlob);
                                for (let tuioListener of this._tuioListeners) {
                                    tuioListener.addTuioBlob(tuioBlob);
                                }
                            }
                        }
                    }
                    for (let tuioListener of this._tuioListeners) {
                        tuioListener.refresh(this._currentTime);
                    }
                }
                this._blobSetMessages = [];
                this._blobAliveMessage = null;
            }
        }
    }
}