import { TuioState } from "../common/TuioState";

export class Tuio11Cursor {
    private tuioState: TuioState;
    private _cursorId: number;

    constructor(cursorId: number) {
        this.tuioState = TuioState.Idle;
        this._cursorId = cursorId;
    }

    get cursorId(): number {
        return this._cursorId;
    }

    public remove() {
        this.tuioState = TuioState.Removed;
    }
}