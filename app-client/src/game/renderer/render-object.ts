import { DisplayObject, ObservablePoint } from "pixi.js";
import { lerp } from "../../../../app-shared/utils";

/**
 * Renderable object
 */
class RenderObject {
  displayObject: DisplayObject;
  id: string;
  onUpdate?: { (dt: number, now: number): void };

  constructor(displayObject: DisplayObject, id = "") {
    this.displayObject = displayObject;
    this.id = id;
  }

  update(dt: number, now: number) {
    this.onUpdate?.(dt, now);
  }

  // getters, setters
  setPosition(x: number, y: number) {
    this.displayObject.position.set(x, y);
  }

  setOffset(x: number, y: number): void {
    this.displayObject.pivot.set(x, y);
  }

  setRotation(angle: number) {
    this.displayObject.rotation = angle;
  }

  move(x: number, y: number) {
    this.displayObject.position.x += x;
    this.displayObject.position.y += y;
  }

  lerpTo(x: number, y: number, t: number) {
    this.position.x = lerp(this.position.x, x, t);
    this.position.y = lerp(this.position.y, y, t);
  }

  rotate(angle: number) {
    this.displayObject.rotation += angle;
  }

  get position(): ObservablePoint {
    return this.displayObject.position;
  }

  get rotation(): number {
    return this.displayObject.rotation;
  }
}

export { RenderObject };
