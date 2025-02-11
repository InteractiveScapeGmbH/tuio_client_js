import {Tuio20Component} from "./Tuio20Component.js";

export class Tuio20Symbol extends Tuio20Component {
    constructor(startTime, container, tuId, cId, group, data){
        super(startTime, container, 0, 0, 0, 0, 0, 0, 0, 0);
        this._tuId = tuId;
        this._cId = cId;
        this._group = group;
        this._data = data;
    }

    get tuId(){
        return this._tuId;
    }

    get cId(){
        return this._cId;
    }

    get group(){
        return this._group;
    }

    get data(){
        return this._data;
    }

    _hasChanged(tuId, cId, group, data) {
        return !(tuId === this.tuId && cId === this.cId && group === this.group && data === this.data);
    }

    _update(currentTime, tuId, cId, group, data){
        this._updateComponent(currentTime, 0, 0, 0, 0, 0, 0, 0, 0);
        this._tuId = tuId;
        this._cId = cId;
        this._group = group;
        this._data = data;
    }
}