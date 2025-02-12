import { Tuio11Dispatcher } from "../tuio11/Tuio11Dispatcher";
import { Tuio20Dispatcher } from "../tuio20/Tuio20Dispatcher";
import { TuioDispatcher } from "./TuioDispatcher";
import { TuioVersion } from "./TuioVersion";
import { WebsocketReceiver } from "./WebsocketReceiver";


export class TuioSession {
    private host: string;
    private port: number;
    private receiver: WebsocketReceiver;
    private dispatcher: TuioDispatcher;

    constructor(tuioVersion: TuioVersion, host: string, port: number) {
        this.host = host;
        this.port = port;
        console.log(`Create TuioSession for ${tuioVersion} on ${host}:${port}`);
        switch (tuioVersion) {
            case TuioVersion.Tuio11: {
                this.dispatcher = new Tuio11Dispatcher();
                break;
            }
            case TuioVersion.Tuio20: {
                this.dispatcher = new Tuio20Dispatcher();
                break;
            }
        }

        this.receiver = new WebsocketReceiver(this.host, this.port);
        this.dispatcher.setupProcessor(this.receiver);
        this.dispatcher.registerCallbacks();
        this.receiver.connect();
    }
}
