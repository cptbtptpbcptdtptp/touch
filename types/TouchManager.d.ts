import { Engine, Entity } from "oasis-engine";
export declare class TouchManager {
    private CanvasEvent;
    private static _ins;
    static get ins(): TouchManager;
    private touchItemHash;
    private webCanvas;
    private tempVPVec;
    private tempCameraVPVec;
    private tempRay;
    private listenerState;
    private engine;
    constructor();
    initEngine(engine: Engine): void;
    private touchToVPPos;
    private mouseToVPPos;
    private pointToRay;
    private checkHit;
    private updateListener;
    private checkNeedListen;
    private onMouseDown;
    private onTouchStart;
    private onMouseUp;
    private onTouchEnd;
    regTouch(entity: Entity, type: TouchType, cbFun: Function): void;
    removeTouch(entity: Entity, type: TouchType, cbFun?: Function): void;
}
export declare enum OptType {
    Add = 0,
    Del = 1
}
export declare enum TouchType {
    MouseDown = 1,
    MouseUp = 2,
    Click = 4
}
