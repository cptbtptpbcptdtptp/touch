import { Entity } from "@oasis-engine/core";
import { TouchType } from "./TouchManager";

export class TouchItem {
  public entity: Entity;
  public touchCBListHash: { [key: number]: Function[] };
  constructor(entity: Entity) {
    this.entity = entity;
    this.touchCBListHash = {};
  }

  addTouch(type: TouchType, cb: Function) {
    if (!this.touchCBListHash[type]) {
      this.touchCBListHash[type] = [];
    }
    const cbList = this.touchCBListHash[type];
    if (cbList.indexOf(cb) < 0) {
      cbList.push(cb);
    }
  }

  delTouch(type: TouchType, cb?: Function) {
    const cbList = this.touchCBListHash[type];
    if (cb) {
      const index = cbList ? cbList.indexOf(cb) : -1;
      if (index >= 0) {
        cbList.splice(index, 1);
      }
    } else {
      cbList && (cbList.length = 0);
    }
  }
}
