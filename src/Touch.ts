import { ACollider, Component, Entity } from "oasis-engine";
import { OptType, TouchManager, TouchType } from "./TouchManager";
export class Touch extends Component {
  // @ts-ignore
  private collider: ACollider;
  constructor(entity: Entity) {
    super(entity);
    const collider = this.entity.getComponent(ACollider);
    if (collider) {
      this.collider = collider;
      // @ts-ignore
      this.collider.touchCBListHash = {};
    } else {
      console.warn("Please set the collider first");
    }
  }

  // Add listener
  on(type: TouchType, cbFun: Function): void {
    // @ts-ignore
    const touchCBListHash = this.collider.touchCBListHash;
    if (!touchCBListHash[type]) {
      touchCBListHash[type] = [];
    }
    const cbList = touchCBListHash[type];
    if (cbList.indexOf(cbFun) < 0) {
      cbList.push(cbFun);
      TouchManager.ins.addTouch(type, this.collider);
    }
  }

  // Remove listener
  off(type: TouchType, cbFun?: Function): void {
    // @ts-ignore
    const cbList = this.collider.touchCBListHash[type];
    if (cbFun) {
      const index = cbList ? cbList.indexOf(cbFun) : -1;
      if (index >= 0) {
        cbList.splice(index, 1);
        TouchManager.ins.removeTouch(type, this.collider);
      }
    } else {
      cbList && (cbList.length = 0);
    }
  }
}
