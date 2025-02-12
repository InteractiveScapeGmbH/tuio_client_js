import OSC from "osc-js";

export type OscCallback = (data: OSC.Message) => void;

export interface MessageListener {
    profile: string,
    callback: OscCallback
}