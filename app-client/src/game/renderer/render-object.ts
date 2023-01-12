import { Container, DisplayObject, ObservablePoint } from "pixi.js";
import { lerp } from "../../../../app-shared/utils";
import ClockTimer from "@gamestdio/timer";

/**
 * Renderable object
 */
class RenderObject {
  container: Container;
  id: string;
  timer: ClockTimer;
  onUpdate?: { (dt: number, now: number): void };

  constructor(id = "") {
    this.container = new Container();
    this.id = id;
    this.timer = new ClockTimer();
  }

  update(dt: number, now: number) {
    this.onUpdate?.(dt, now);
    this.timer.tick();
  }

  // getters, setters
  addChild(object: DisplayObject) {
    this.container.addChild(object);
  }

  setPosition(x: number, y: number) {
    this.container.position.set(x, y);
  }

  setOffset(x: number, y: number): void {
    this.container.pivot.set(x, y);
  }

  setRotation(angle: number) {
    this.container.rotation = angle;
  }

  move(x: number, y: number) {
    this.container.position.x += x;
    this.container.position.y += y;
  }

  lerpTo(x: number, y: number, t: number) {
    this.position.x = lerp(this.position.x, x, t);
    this.position.y = lerp(this.position.y, y, t);
  }

  rotate(angle: number) {
    this.container.rotation += angle;
  }

  get position(): ObservablePoint {
    return this.container.position;
  }

  get rotation(): number {
    return this.container.rotation;
  }
}

export { RenderObject };
