import { Camera, Engine, Entity, Ray, Vector2, ACollider } from "oasis-engine";
import { TouchItem } from "./TouchItem";
export class TouchManager {
  private CanvasEvent = {
    touchend: "touchend",
    touchstart: "touchstart",
    mouseup: "mouseup",
    mousedown: "mousedown",
    click: "click",
  };

  private static _ins: TouchManager;
  public static get ins(): TouchManager {
    if (!this._ins) {
      this._ins = new TouchManager();
    }
    return this._ins;
  }

  private touchItemHash: { [key: number]: TouchItem };
  private webCanvas: any;
  private tempVPVec: Vector2;
  private tempCameraVPVec: Vector2;
  private tempRay: Ray;
  // 记录当前监听的状态
  private listenerState = 0;
  // @ts-ignore
  private engine: Engine;

  constructor() {
    this.touchItemHash = {};
    this.tempVPVec = new Vector2();
    this.tempCameraVPVec = new Vector2();
    this.tempRay = new Ray();
  }

  public initEngine(engine: Engine) {
    // 当前的 engine
    if (this.engine != engine) {
      this.engine = engine;
      // @ts-ignore
      this.webCanvas = this.engine.canvas._webCanvas;
    }
  }

  // 触摸时将屏幕上点转换为 viewport 上的点
  private touchToVPPos = (touchEvt: TouchEvent, pos: Vector2): boolean => {
    const { changedTouches = [], target } = touchEvt;
    if (changedTouches.length > 0) {
      // @ts-ignore
      const { left = 0, top = 0 } = target && target.getBoundingClientRect();
      const touchPos = changedTouches[0];
      const { webCanvas } = this;
      pos.setValue(
        (touchPos.clientX - left) / webCanvas.clientWidth,
        (touchPos.clientY - top) / webCanvas.clientHeight
      );
      return true;
    } else {
      return false;
    }
  };

  // 鼠标点击时将屏幕上点转换为 viewport 上的点
  private mouseToVPPos = (mouseEvt: MouseEvent, pos: Vector2): boolean => {
    const { pageX, pageY, target } = mouseEvt;
    if (target) {
      // @ts-ignore
      const { offsetLeft = 0, offsetTop = 0 } = target;
      const { webCanvas } = this;
      pos.setValue(
        (pageX - offsetLeft) / webCanvas.clientWidth,
        (pageY - offsetTop) / webCanvas.clientHeight
      );
      return true;
    } else {
      return false;
    }
  };

  // 根据屏幕上的 clentX 和 clentY 得到一条射线
  private pointToRay = (camera: Camera, pos: Vector2): Boolean => {
    const { tempVPVec, tempRay } = this;
    const viewport = camera.viewport;
    pos.setValue(
      (tempVPVec.x - viewport.x) / viewport.z,
      (tempVPVec.y - viewport.y) / viewport.w
    );
    if (pos.x >= 0 && pos.x <= 1 && pos.y >= 0 && pos.y <= 1) {
      camera.viewportPointToRay(pos, tempRay);
      return true;
    } else {
      return false;
    }
  };

  private checkHit = (touchType: TouchType, evt: MouseEvent | TouchEvent) => {
    if (!this.engine) {
      console.warn(
        "Please call the TouchManager.init method to initialize before use"
      );
    }
    // 根据触摸点获取真实的 clientpos
    const scene = this.engine.sceneManager.activeScene;
    // @ts-ignore
    const actCameras: Camera[] = scene._activeCameras;
    const { touchItemHash, tempCameraVPVec, tempRay } = this;
    // 遍历活动着的相机
    for (let index = actCameras.length - 1; index >= 0; index--) {
      const tempCamera = actCameras[index];
      // 这个相机是活动着的 并且点击区域在这个相机的 viewPort 中
      if (tempCamera.enabled && this.pointToRay(tempCamera, tempCameraVPVec)) {
        const collider: ACollider = <ACollider>scene.raycast(tempRay);
        if (collider) {
          // 命中了一个实体
          const entityID = collider.entity.instanceId;
          const touchItem = touchItemHash[entityID];
          const cbList = touchItem
            ? touchItem.touchCBListHash[touchType]
            : null;
          if (cbList && cbList.length > 0) {
            for (let i = 0; i < cbList.length; i++) {
              cbList[i](evt);
            }
          }
        }
      }
    }
  };

  // 只更新有差异的 canvas 监听
  private updateListener = (optType: OptType, touchType: TouchType) => {
    const preState = (this.listenerState & touchType) !== 0;
    if (preState && optType == OptType.Add) {
      //已经监听，此时再增加则无需改变
      return;
    }
    if (!preState && optType == OptType.Del) {
      //没有监听，此时再移除也无需改变
      return;
    }
    const { CanvasEvent, webCanvas } = this;
    switch (optType) {
      case OptType.Add:
        switch (touchType) {
          case TouchType.MouseDown:
            webCanvas.addEventListener(CanvasEvent.mousedown, this.onMouseDown);
            webCanvas.addEventListener(
              CanvasEvent.touchstart,
              this.onTouchStart
            );
            break;
          case TouchType.MouseUp:
            webCanvas.addEventListener(CanvasEvent.mouseup, this.onMouseUp);
            webCanvas.addEventListener(CanvasEvent.touchend, this.onTouchEnd);
            break;
          default:
            break;
        }
        this.listenerState |= touchType;
        break;
      case OptType.Del:
        // 判断是否需要监听
        if (this.checkNeedListen(touchType) != preState) {
          switch (touchType) {
            case TouchType.MouseDown:
              webCanvas.removeEventListener(
                CanvasEvent.mousedown,
                this.onMouseDown
              );
              webCanvas.removeEventListener(
                CanvasEvent.touchstart,
                this.onTouchStart
              );
              break;
            case TouchType.MouseUp:
              webCanvas.removeEventListener(
                CanvasEvent.mouseup,
                this.onMouseUp
              );
              webCanvas.removeEventListener(
                CanvasEvent.touchend,
                this.onTouchEnd
              );
              break;
            default:
              break;
          }
          this.listenerState &= ~touchType;
        }
        break;
      default:
        break;
    }
  };

  // 是否有必要监听这个类型
  private checkNeedListen = (touchType: TouchType): boolean => {
    const touchItemHash = this.touchItemHash;
    // 是否有监听这种触摸事件
    for (const key in touchItemHash) {
      const cbList = touchItemHash[key].touchCBListHash[touchType];
      if (cbList && cbList.length > 0) {
        return true;
      }
    }
    return false;
  };

  private onMouseDown = (mouseEvt: MouseEvent) => {
    if (mouseEvt && this.mouseToVPPos(mouseEvt, this.tempVPVec)) {
      this.checkHit(TouchType.MouseDown, mouseEvt);
    }
  };

  private onTouchStart = (touchEvt: any) => {
    if (touchEvt && this.touchToVPPos(touchEvt, this.tempVPVec)) {
      this.checkHit(TouchType.MouseDown, touchEvt);
    }
  };

  private onMouseUp = (mouseEvt: any) => {
    if (mouseEvt && this.mouseToVPPos(mouseEvt, this.tempVPVec)) {
      this.checkHit(TouchType.MouseUp, mouseEvt);
    }
  };

  private onTouchEnd = (touchEvt: any) => {
    if (touchEvt && this.touchToVPPos(touchEvt, this.tempVPVec)) {
      this.checkHit(TouchType.MouseUp, touchEvt);
    }
  };

  public regTouch(entity: Entity, type: TouchType, cbFun: Function) {
    const touchItem = (this.touchItemHash[entity.instanceId] ||= new TouchItem(
      entity
    ));
    touchItem.addTouch(type, cbFun);
    // 增加一个手势 需要更新监听
    this.updateListener(OptType.Add, type);
  }

  public removeTouch(entity: Entity, type: TouchType, cbFun?: Function) {
    const touchItem = this.touchItemHash[entity.instanceId];
    if (touchItem) {
      touchItem.delTouch(type, cbFun);
      // 移除一个手势 需要更新监听
      this.updateListener(OptType.Del, type);
    }
  }
}

export enum OptType {
  Add = 0,
  Del = 1,
}

export enum TouchType {
  MouseDown = 1,
  MouseUp = 2,
  Click = 4,
}
