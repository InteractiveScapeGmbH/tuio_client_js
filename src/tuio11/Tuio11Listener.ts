import { TuioTime } from "../common/TuioTime";
import { Tuio11Blob } from "./Tuio11Blob";
import { Tuio11Cursor } from "./Tuio11Cursor";
import { Tuio11Object } from "./Tuio11Object";

export interface Tuio11Listener {

    addTuioObject(tuioObject: Tuio11Object): void;
    updateTuioObject(tuioObject: Tuio11Object): void;
    removeTuioObject(tuioObject: Tuio11Object): void;

    addTuioCursor(tuioCursor: Tuio11Cursor): void;
    updateTuioCursor(tuioCursor: Tuio11Cursor): void;
    removeTuioCursor(tuioCursor: Tuio11Cursor): void;

    addTuioBlob(tuioBlob: Tuio11Blob): void;
    updateTuioBlob(tuioBlob: Tuio11Blob): void;
    removeTuioBlob(tuioBlob: Tuio11Blob): void;

    refresh(frameTime: TuioTime): void;
}