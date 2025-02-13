import { TuioTime } from "./common/TuioTime";
import { WebsocketTuioReceiver } from "./common/WebsocketTuioReceiver";
import { Tuio11Blob } from "./tuio11/Tuio11Blob";
import { Tuio11Client } from "./tuio11/Tuio11Client";
import { Tuio11Cursor } from "./tuio11/Tuio11Cursor";
import { Tuio11Listener } from "./tuio11/Tuio11Listener";
import { Tuio11Object } from "./tuio11/Tuio11Object";

class DebugTuio11Listener implements Tuio11Listener {
    addTuioObject(tuioObject: Tuio11Object) {

    }

    updateTuioObject(tuioObject: Tuio11Object) {
    }

    removeTuioObject(tuioObject: Tuio11Object) {
    }

    addTuioCursor(tuioCursor: Tuio11Cursor) {
    }

    updateTuioCursor(tuioCursor: Tuio11Cursor) {
        console.log(tuioCursor.position);
    }

    removeTuioCursor(tuioCursor: Tuio11Cursor) {
    }

    addTuioBlob(tuioBlob: Tuio11Blob) {
    }

    updateTuioBlob(tuioBlob: Tuio11Blob) {
    }

    removeTuioBlob(tuioBlob: Tuio11Blob) {
    }

    refresh(frameTime: TuioTime) {
    }

}

const client = new Tuio11Client(new WebsocketTuioReceiver("ws://127.0.0.1:3333"));
client.addTuioListener(new DebugTuio11Listener())
client.connect();