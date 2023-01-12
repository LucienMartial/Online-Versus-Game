import SAT from "sat";
import { BodyEntity } from "../game/index.js";
import { BoxShape } from "../physics/index.js";
import { PlayerState } from "../state/game-state.js";
import { Inputs, Timer } from "../utils/index.js";

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
  dashTimer: Timer;
  dashForce: SAT.Vector;
  isDead: boolean;
  deadCallback: Function;
  isLeft: boolean;
  private isPuppet: boolean;

  constructor(id: string, isPuppet: boolean, deadCallback: Function) {
    // default
    const collisionShape = new BoxShape(WIDTH, HEIGHT);
    super(collisionShape, false, id);
    this.setOffset(WIDTH / 2, HEIGHT / 2);

    // custom
    this.isPuppet = isPuppet;
    this.isLeft = false;
    this.friction = new SAT.Vector(FRICTION, FRICTION);
    this.direction = new SAT.Vector();
    this.maxSpeed = MAX_SPEED;
    this.isDead = false;
    this.deadCallback = deadCallback;
    this.canDash = true;
    this.isDashing = false;
    this.dashForce = new SAT.Vector();

    // timers
    this.dashTimer = new Timer();
    this.registerTimer();
  }

  registerTimer() {
    // end of dash
    this.dashTimer.add(DASH_DURATION, () => {
      this.isDashing = false;
      this.maxSpeed = MAX_SPEED;
    });
    // cooldown
    this.dashTimer.add(DASH_COOLDOWN, () => {
      this.canDash = true;
    });
  }

  onCollision(response: SAT.Response, other: BodyEntity) {
    if (this.isPuppet) return;
    // dynamic bodies
    if (!other.static) {
      if (!this.isDead) this.deadCallback(this);
      this.isDead = true;
      return;
    }
    // static bodies
    this.move(-response.overlapV.x, -response.overlapV.y);
    super.onCollision(response, other);
  }

  processInput(inputs: Record<Inputs, boolean>) {
    if (this.isPuppet) return;

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
      this.dashTimer.reset();
      this.canDash = false;
      this.isDashing = true;
      this.maxSpeed = DASH_SPEED;
      this.dashForce = this.direction.clone().scale(DASH_SPEED);
    }
  }

  synchronize(state: PlayerState) {
    this.setPosition(state.x, state.y);
    this.canDash = state.canDash;
    this.isDashing = state.isDashing;
    this.dashTimer.sync(state.dashTimer);
    if (state.isDashing) this.maxSpeed = DASH_SPEED;
  }

  update(dt: number): void {
    if (this.isPuppet) return;
    super.update(dt);

    // dash
    if (!this.canDash) {
      this.dashTimer.update();
      // dashing
      if (this.isDashing) {
        this.setVelocity(this.dashForce.x, this.dashForce.y);
      }
    }
  }
}

export { Player };
