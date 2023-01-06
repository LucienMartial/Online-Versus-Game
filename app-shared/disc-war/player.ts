import SAT, { Vector } from "sat";
import { BodyEntity } from "../game/index.js";
import { BoxShape } from "../physics/index.js";
import { Inputs } from "../utils/index.js";

// shape
const WIDTH = 80;
const HEIGHT = 160;

// movement
const FRICTION = 0.9;
const ACCELERATION = 80;
const MAX_SPEED = 800;
const DASH_SPEED = 2000;
const DASH_DURATION = 300;

class Player extends BodyEntity {
  direction: SAT.Vector;
  canDash: boolean;
  dashDirection: SAT.Vector;
  dashStart: number;

  constructor(id: string) {
    // default
    const collisionShape = new BoxShape(WIDTH, HEIGHT);
    super(collisionShape, false, id);

    // custom
    this.friction = new SAT.Vector(FRICTION, FRICTION);
    this.direction = new SAT.Vector();
    this.maxSpeed = MAX_SPEED;

    this.canDash = true;
    this.dashDirection = new SAT.Vector();
    this.dashStart = 0;
  }

  processInput(inputs: Record<Inputs, boolean>) {
    this.direction = new SAT.Vector();

    // get direction
    if (inputs.left) this.direction.x = -1;
    else if (inputs.right) this.direction.x = 1;
    if (inputs.up) this.direction.y = -1;
    else if (inputs.down) this.direction.y = 1;

    // do not continue if there is no movement
    if (!(this.direction.len() > 0)) return;
    this.direction.normalize();

    // move
    const acc = this.direction.clone().scale(ACCELERATION);
    this.accelerate(acc.x, acc.y);

    // apply dash
    if (inputs.dash && this.canDash) {
      this.maxSpeed = DASH_SPEED;
      this.friction = new SAT.Vector(0.92, 0.92);
      this.canDash = false;
      const dashForce = this.direction.clone().scale(DASH_SPEED);
      this.velocity.copy(dashForce);
      this.dashStart = 0;
    }
  }

  update(dt: number): void {
    if (!this.canDash) {
      this.dashStart += dt * 1000;
      if (this.dashStart > DASH_DURATION) {
        this.friction = new SAT.Vector(FRICTION, FRICTION);
        this.maxSpeed = MAX_SPEED;
        this.canDash = true;
      }
    }
  }
}

export { Player };
