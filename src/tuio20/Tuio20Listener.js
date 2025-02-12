export class Tuio20Listener {
    constructor() {
        if (this.constructor === Tuio20Listener) {
            throw new TypeError('Abstract class "Tuio20Listener" cannot be instantiated directly.');
        }
    }

    tuioAdd(tuioObject){
    }

    tuioUpdate(tuioObject){
    }

    tuioRemove(tuioObject){
    }

    tuioRefresh(tuioTime){
    }
}