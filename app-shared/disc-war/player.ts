import SAT from "sat";
import { BodyEntity } from "../game/index.js";
import { BoxShape } from "../physics/index.js";
import { PlayerState } from "../state/game-state.js";
import { Inputs } from "../utils/index.js";

// shape
const WIDTH = 80;
const HEIGHT = 160;

// movement. 0 friction mean full determinism
const FRICTION = 0;
const MAX_SPEED = 800;
const DASH_SPEED = 2200;

// 1 second = 60 ticks
const DASH_DURATION = 0.2 * 60;
const DASH_COOLDOWN = 0.8 * 60;

class Player extends BodyEntity {
  direction: SAT.Vector;
  canDash: boolean;
  isDashing: boolean;
  dashTimer: number;
  dashForce: SAT.Vector;
  isDead: boolean;

  constructor(id: string) {
    // default
    const collisionShape = new BoxShape(WIDTH, HEIGHT);
    super(collisionShape, false, id);

    // custom
    this.friction = new SAT.Vector(FRICTION, FRICTION);
    this.direction = new SAT.Vector();
    this.maxSpeed = MAX_SPEED;

    // dash
    this.dashTimer = 0;
    this.canDash = true;
    this.isDashing = false;
    this.dashForce = new SAT.Vector();
    this.isDead = false;
  }

  processInput(inputs: Record<Inputs, boolean>) {
    // if dashing, do not move
    if (this.isDashing) return;

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
      this.dashTimer = 0;
      this.canDash = false;
      this.isDashing = true;
      this.maxSpeed = DASH_SPEED;
      this.dashForce = this.direction.clone().scale(DASH_SPEED);
    }
  }

  synchronize(state: PlayerState) {
    this.setPosition(state.x, state.y);
    this.dashTimer = state.dashTimer;
    this.canDash = state.canDash;
    this.isDashing = state.isDashing;
    if (state.isDashing) this.maxSpeed = DASH_SPEED;
  }

  update(dt: number): void {
    super.update(dt);

    // dash
    if (!this.canDash) {
      this.dashTimer += 1;

      // dash cooldown
      if (this.dashTimer >= DASH_COOLDOWN) {
        this.canDash = true;
      }

      // not dashing anymore
      if (this.dashTimer >= DASH_DURATION) {
        this.isDashing = false;
        this.maxSpeed = MAX_SPEED;
      }

      // dashing
      if (this.isDashing) {
        this.setVelocity(this.dashForce.x, this.dashForce.y);
      }
    }
  }
  onCollision(response: SAT.Response, other: BodyEntity) {
    this.isDead = true;
    if (!other.static) return;
    this.move(-response.overlapV.x, -response.overlapV.y);
    super.onCollision(response, other);
  }
}

export { Player };
