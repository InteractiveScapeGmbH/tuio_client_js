export class Tuio11Listener {
    constructor() {
        if (this.constructor === Tuio11Listener) {
            throw new TypeError('Abstract class "Tuio11Listener" cannot be instantiated directly.');
        }
    }

    addTuioObject(tuioObject){
    }

    updateTuioObject(tuioObject){
    }

    removeTuioObject(tuioObject){
    }

    addTuioCursor(tuioCursor){
    }

    updateTuioCursor(tuioCursor){
    }

    removeTuioCursor(tuioCursor){
    }

    addTuioBlob(tuioBlob){
    }

    updateTuioBlob(tuioBlob){
    }

    removeTuioBlob(tuioBlob){
    }

    refresh(frameTime){
    }
}