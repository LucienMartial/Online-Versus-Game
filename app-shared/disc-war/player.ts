import SAT, { Vector } from "sat";
import { BodyEntity } from "../game/index.js";
import { BoxShape } from "../physics/index.js";
import { Inputs } from "../utils/index.js";

// shape
const WIDTH = 80;
const HEIGHT = 160;

// movement. 0 friction mean full determinism
const FRICTION = 0;
const MAX_SPEED = 800;
const DASH_SPEED = 2000;
const DASH_DURATION = 200;
const DASH_COOLDOWN = 1000;

class Player extends BodyEntity {
  direction: SAT.Vector;
  canDash: boolean;
  isDashing: boolean;
  dashStart: number;
  dashBegin: number;
  dashForce: SAT.Vector;

  constructor(id: string) {
    // default
    const collisionShape = new BoxShape(WIDTH, HEIGHT);
    super(collisionShape, false, id);

    // custom
    this.friction = new SAT.Vector(FRICTION, FRICTION);
    this.direction = new SAT.Vector();
    this.maxSpeed = MAX_SPEED;

    // dash
    this.canDash = true;
    this.dashBegin = 0;
    this.isDashing = false;
    this.dashStart = 0;
    this.dashForce = new SAT.Vector();
  }

  processInput(now: number, inputs: Record<Inputs, boolean>) {
    if (now < this.dashBegin + DASH_DURATION) return;

    // get direction
    this.direction = new SAT.Vector();
    if (inputs.left) this.direction.x = -1;
    else if (inputs.right) this.direction.x = 1;
    if (inputs.up) this.direction.y = -1;
    else if (inputs.down) this.direction.y = 1;

    // do not continue if there is no movement
    if (!(this.direction.len() > 0)) return;
    this.direction.normalize();

    // move
    const force = this.direction.clone().scale(MAX_SPEED);
    this.setVelocity(force.x, force.y);

    // apply dash
    if (inputs.dash && this.canDash) {
      this.dashBegin = now;
      this.dashStart = 0;
      this.canDash = false;
      this.isDashing = true;
      this.maxSpeed = DASH_SPEED;
      this.dashForce = this.direction.clone().scale(DASH_SPEED);
      this.setVelocity(this.dashForce.x, this.dashForce.y);
    }
  }

  update(dt: number, now: number): void {
    super.update(dt, now);
    if (!this.canDash) {
      this.dashStart += dt * 1000;
      // still dashing
      if (this.dashStart < DASH_DURATION) {
        this.setVelocity(this.dashForce.x, this.dashForce.y);
      }
      // end of dash
      if (this.dashStart > DASH_DURATION) {
        this.isDashing = false;
        this.maxSpeed = MAX_SPEED;
      }
      // cooldown
      if (this.dashStart > DASH_COOLDOWN) {
        this.canDash = true;
      }
    }
  }
}

export { Player };
