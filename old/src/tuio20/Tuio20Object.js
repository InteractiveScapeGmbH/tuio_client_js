import {TuioState} from "../common/TuioState.js";

export class Tuio20Object {
    constructor(startTime, sessionId){
        this._startTime = startTime;
        this._currentTime = startTime;
        this._sessionId = sessionId;
        this._token = null;
        this._pointer = null;
        this._bounds = null;
        this._symbol = null;
        this._state = TuioState.Added;
    }

    _update(currentTime){
        this._currentTime = currentTime;
        this._state = TuioState.Idle;
    }

    get startTime(){
        return this._startTime;
    }

    get currentTime(){
        return this._currentTime;
    }

    get sessionId(){
        return this._sessionId;
    }

    get token(){
        return this._token;
    }

    get pointer(){
        return this._pointer;
    }

    get bounds(){
        return this._bounds;
    }

    get symbol(){
        return this._symbol;
    }

    get state(){
        return this._state;
    }

    setTuioToken(token){
        this._token = token;
        this._state = TuioState.Added;
    }

    setTuioPointer(pointer){
        this._pointer = pointer;
        this._state = TuioState.Added;
    }

    setTuioBounds(bounds){
        this._bounds = bounds;
        this._state = TuioState.Added;
    }

    setTuioSymbol(symbol){
        this._symbol = symbol;
        this._state = TuioState.Added;
    }

    containsTuioToken(){
        return this._token !== null;
    }

    containsTuioPointer(){
        return this._pointer !== null;
    }

    containsTuioBounds(){
        return this._bounds !== null;
    }

    containsTuioSymbol(){
        return this._symbol !== null;
    }

    containsNewTuioToken(){
        return this._token !== null && this._token._state === TuioState.Added;
    }

    containsNewTuioPointer(){
        return this._pointer !== null && this._pointer._state === TuioState.Added;
    }

    containsNewTuioBounds(){
        return this._bounds !== null && this._bounds._state === TuioState.Added;
    }

    containsNewTuioSymbol(){
        return this._symbol !== null && this._symbol._state === TuioState.Added;
    }

    _remove(currentTime){
        this._currentTime = currentTime;
        if(this._token !== null){
            this._token._remove(currentTime);
        }
        if(this._pointer !== null){
            this._pointer._remove(currentTime);
        }
        if(this._bounds !== null){
            this._bounds._remove(currentTime);
        }
        if(this._symbol !== null){
            this._symbol._remove(currentTime);
        }
        this._state = TuioState.Removed;
    }
}
