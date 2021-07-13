import { Script } from "oasis-engine";
import { TouchType } from "./TouchManager";
export declare class Touch extends Script {
    on(touchType: TouchType, cbFun: Function): void;
    off(touchType: TouchType, cbFun?: Function): void;
}
