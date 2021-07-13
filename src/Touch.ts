import { ACollider, Script } from "oasis-engine";
import { TouchManager, TouchType } from "./TouchManager";
export class Touch extends Script {
  // Add listener
  public on(touchType: TouchType, cbFun: Function): void {
    if (this.entity.getComponent(ACollider)) {
      TouchManager.ins.regTouch(this.entity, touchType, cbFun);
    } else {
      console.warn("Please set the collider first");
    }
  }

  // Remove listener
  public off(touchType: TouchType, cbFun?: Function): void {
    TouchManager.ins.removeTouch(this.entity, touchType, cbFun);
  }
}
