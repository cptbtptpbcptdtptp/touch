import { Entity } from "@oasis-engine/core";
import { TouchType } from "./TouchManager";
export declare class TouchItem {
    entity: Entity;
    touchCBListHash: {
        [key: number]: Function[];
    };
    constructor(entity: Entity);
    addTouch(type: TouchType, cb: Function): void;
    delTouch(type: TouchType, cb?: Function): void;
}
