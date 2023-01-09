import SAT from "sat";
import { lerp } from "../utils/index.js";

class Entity {
  id: string;
  private _position: SAT.Vector;

  constructor(id = "") {
    this.id = id;
    this._position = new SAT.Vector();
  }

  update(dt: number, now: number) {}

  // position
  setPosition(x: number, y: number) {
    this._position.x = x;
    this._position.y = y;
  }

  move(x: number, y: number) {
    this._position.x += x;
    this._position.y += y;
  }

  lerpTo(x: number, y: number, t: number = 0.05) {
    this._position.x = lerp(this._position.x, x, t);
    this._position.y = lerp(this._position.y, y, t);
  }

  get position(): SAT.Vector {
    return this._position;
  }
}

export { Entity };
