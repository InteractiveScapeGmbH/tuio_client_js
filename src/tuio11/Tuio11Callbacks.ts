import { Tuio11Blob } from "./Tuio11Blob";
import { Tuio11Cursor } from "./Tuio11Cursor";
import { Tuio11Object } from "./Tuio11Object";
import { TuioTime } from "../common/TuioTime";

export type OnCursorAdd = (tuioCursor: Tuio11Cursor) => void;
export type OnCursorUpdate = (tuioCursor: Tuio11Cursor) => void;
export type OnCursorRemove = (tuioCursor: Tuio11Cursor) => void;

export type OnObjectAdd = (tuioObject: Tuio11Object) => void;
export type OnObjectUpdate = (tuioObject: Tuio11Object) => void;
export type OnObjectRemove = (tuioObject: Tuio11Object) => void;

export type OnBlobAdd = (tuioBlob: Tuio11Blob) => void;
export type OnBlobUpdate = (tuioBlob: Tuio11Blob) => void;
export type OnBlobRemove = (tuioBlob: Tuio11Blob) => void;

export type OnRefresh = (tuioTime: TuioTime) => void;
