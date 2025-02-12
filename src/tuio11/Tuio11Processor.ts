import OSC from "osc-js";
import { WebsocketReceiver } from "../common/WebsocketReceiver"
import { TuioTime } from "../common/TuioTime";
import { Tuio11Object } from "./Tuio11Object";
import { Tuio11Cursor } from "./Tuio11Cursor";
import { Tuio11Blob } from "./Tuio11Blob";

export class Tuio11Processor {
    // private currentTime: TuioTime;
    private tuioObjects: Map<number, Tuio11Object> = new Map();
    private tuioCursors: Map<number, Tuio11Cursor> = new Map();
    private tuioBlob: Map<number, Tuio11Blob> = new Map();
    private objectSetMessages: OSC.Message[] = [];
    private cursorSetMessages: OSC.Message[] = [];
    private blobSetMessages: OSC.Message[] = [];

    private objectAliveMessage: OSC.Message | null = null;
    private cursorAliveMessage: OSC.Message | null = null;
    private blobAliveMessage: OSC.Message | null = null;

    private freeCursorIds: number[] = [];
    private freeBlobIds: number[] = [];

    constructor(receiver: WebsocketReceiver) {
        receiver.addMessageListeners([
            { profile: "/tuio/2Dobj", callback: this.on2Dobj },
            { profile: "/tuio/2Dcur", callback: this.on2Dcur },
            { profile: "/tuio/2Dblb", callback: this.on2Dblb }
        ]);
        // TuioTime.init();
        // this.currentTime = TuioTime.getCurrentTime();

    }

    private updateFrame(frameId: number): boolean {
        return true;
    }


    private on2Dobj(message: OSC.Message) {
        console.log(`OnObj: ${message}`);
    }

    private on2Dcur(oscMessage: OSC.Message) {
        console.log(`OnCur: ${oscMessage.args}`);
        let command = oscMessage.args[0];
        if (command === "set") {
            this.cursorSetMessages.push(oscMessage);
        } else if (command === "alive") {
            this.cursorAliveMessage = oscMessage;
        } else if (command === "fseq") {
            let fseq = Number(oscMessage.args[1]);
            if (this.updateFrame(fseq)) {
                if (this.cursorAliveMessage !== null) {
                    let currentSessionIds = new Set(this.tuioCursors.keys());
                    let aliveSessionIds = new Set(this.cursorAliveMessage.args.slice(1).map(arg => arg));
                    let removedSessionIds = new Set([...currentSessionIds].filter(x => !aliveSessionIds.has(x)));
                    for (let sessionId of removedSessionIds) {
                        let tuioCursor = this.tuioCursors.get(sessionId);
                        if (!tuioCursor) continue;
                        tuioCursor?.remove();
                        for (let tuioListener of this._tuioListeners) {
                            tuioListener.removeTuioCursor(tuioCursor);
                        }
                        this.tuioCursors.delete(sessionId);
                        this.freeCursorIds.push(tuioCursor.cursorId);
                    }
                    this.freeCursorIds.sort();
                    for (let setMessage of this.cursorSetMessages) {
                        let [, s, x, y, X, Y, m] = setMessage.args.map(arg => arg);
                        if (aliveSessionIds.has(s)) {
                            if (currentSessionIds.has(s)) {
                                let tuioCursor = this.tuioCursors.get(s);
                                if (tuioCursor._hasChanged(this._currentTime, x, y, X, Y, m)) {
                                    tuioCursor._update(this._currentTime, x, y, X, Y, m);
                                    for (let tuioListener of this._tuioListeners) {
                                        tuioListener.updateTuioCursor(tuioCursor);
                                    }
                                }
                            } else {
                                let cursorId = this.tuioCursors.size;
                                if (this._freeCursorIds.length > 0) {
                                    cursorId = this._freeCursorIds[0];
                                    this._freeCursorIds.splice(0, 1);
                                }
                                let tuioCursor = new Tuio11Cursor(this._currentTime, s, cursorId, x, y, X, Y, m);
                                this.tuioCursors.set(s, tuioCursor);
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
                this.cursorSetMessages = [];
                this.cursorAliveMessage = null;
            }
        }
    }

    private on2Dblb(message: OSC.Message) {
        console.log(`OnCur: ${message}`);
    }
}