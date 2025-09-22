import { TuioState } from "../common/TuioState.js";
import { TuioTime } from "../common/TuioTime.js";
import { Tuio20Bounds } from "./Tuio20Bounds.js";
import { Tuio20Pointer } from "./Tuio20Pointer.js";
import { Tuio20Symbol } from "./Tuio20Symbol.js";
import { Tuio20Token } from "./Tuio20Token.js";

export class Tuio20Object {
    _startTime: TuioTime;
    _currentTime: TuioTime;
    _sessionId: number;
    _token: Tuio20Token | null;
    _pointer: Tuio20Pointer | null;
    _bounds: Tuio20Bounds | null;
    _symbol: Tuio20Symbol | null;
    _state: TuioState;
    constructor(startTime: TuioTime, sessionId: number) {
        this._startTime = startTime;
        this._currentTime = startTime;
        this._sessionId = sessionId;
        this._token = null;
        this._pointer = null;
        this._bounds = null;
        this._symbol = null;
        this._state = TuioState.Added;
    }

    _update(currentTime: TuioTime) {
        this._currentTime = currentTime;
        this._state = TuioState.Idle;
    }

    get startTime() {
        return this._startTime;
    }

    get currentTime() {
        return this._currentTime;
    }

    get sessionId() {
        return this._sessionId;
    }

    get token() {
        return this._token;
    }

    get pointer() {
        return this._pointer;
    }

    get bounds() {
        return this._bounds;
    }

    get symbol() {
        return this._symbol;
    }

    get state() {
        return this._state;
    }

    setTuioToken(token: Tuio20Token) {
        this._token = token;
        this._state = TuioState.Added;
    }

    setTuioPointer(pointer: Tuio20Pointer) {
        this._pointer = pointer;
        this._state = TuioState.Added;
    }

    setTuioBounds(bounds: Tuio20Bounds) {
        this._bounds = bounds;
        this._state = TuioState.Added;
    }

    setTuioSymbol(symbol: Tuio20Symbol) {
        this._symbol = symbol;
        this._state = TuioState.Added;
    }

    containsTuioToken() {
        return this._token !== null;
    }

    containsTuioPointer() {
        return this._pointer !== null;
    }

    containsTuioBounds() {
        return this._bounds !== null;
    }

    containsTuioSymbol() {
        return this._symbol !== null;
    }

    containsNewTuioToken() {
        return this._token !== null && this._token._state === TuioState.Added;
    }

    containsNewTuioPointer() {
        return this._pointer !== null && this._pointer._state === TuioState.Added;
    }

    containsNewTuioBounds() {
        return this._bounds !== null && this._bounds._state === TuioState.Added;
    }

    containsNewTuioSymbol() {
        return this._symbol !== null && this._symbol._state === TuioState.Added;
    }

    _remove(currentTime: TuioTime) {
        this._currentTime = currentTime;
        if (this._token !== null) {
            this._token._remove(currentTime);
        }
        if (this._pointer !== null) {
            this._pointer._remove(currentTime);
        }
        if (this._bounds !== null) {
            this._bounds._remove(currentTime);
        }
        if (this._symbol !== null) {
            this._symbol._remove(currentTime);
        }
        this._state = TuioState.Removed;
    }
}
