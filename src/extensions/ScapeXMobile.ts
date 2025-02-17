export interface SxmConfig {
    roomId: string;
    mqttUrl: string;
}

export interface SxmMessage {
    type: string;
    topic: string;
    value: string;
}

type SxmConfigEvent = (config: SxmConfig) => void;

export class ScapeXMobile {
    private _ws: WebSocket | null;
    private readonly _scapeEngineAddress: string;
    private readonly _scapeEnginePort: number = 3330;
    private _sxmConfig: SxmConfig;
    private _eventHandlers: SxmConfigEvent[] = [];
    private _defaultMqttUrl: string = "broker.hivemq.com"

    constructor(scapeEngineAddress: string) {
        this._ws = null;
        this._scapeEngineAddress = scapeEngineAddress;
        this._sxmConfig = { roomId: "", mqttUrl: "" };
    }

    public set onConfigChange(handler: SxmConfigEvent) {
        this._eventHandlers.push(handler);
    }

    public connect() {
        this._ws = new WebSocket(`ws://${this._scapeEngineAddress}:${this._scapeEnginePort}`);
        this._ws.onmessage = (message) => this.parseSxmConfig(message);
        this._ws.onclose = (message) => { console.log(message); };
    }

    private parseSxmConfig(message: MessageEvent) {
        const sxmMessage: SxmMessage = JSON.parse(message.data) as SxmMessage;
        console.log(sxmMessage)
        switch (sxmMessage.type) {
            case "server": {
                this._sxmConfig.mqttUrl = sxmMessage.value === "" ? this._defaultMqttUrl : sxmMessage.value;
                break;
            }
            case "subscribe": {
                this._sxmConfig.roomId = sxmMessage.topic.split("/")[0];
                break;
            }
        }
        this._eventHandlers.forEach((handler) => {
            handler(this._sxmConfig);
        })
    }

    public disconnect() {
        this._ws?.close();
    }
}