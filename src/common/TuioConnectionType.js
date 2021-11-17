export class TuioConnectionType {
    static UDP = new TuioConnectionType('UDP');
    static Websocket = new TuioConnectionType('Websocket');

    constructor(name) {
        this.name = name;
    }

    toString() {
        return `TuioConnectionType.${this.name}`;
    }
}