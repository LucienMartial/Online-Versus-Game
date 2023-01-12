import { Schema, MapSchema, type } from "@colyseus/schema";

class PlayerState extends Schema {
  @type("boolean") isLeft: boolean;
  @type("boolean") isDead: boolean;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") dashTimer: number;
  @type("boolean") isDashing: boolean;
  @type("boolean") canDash: boolean;

  constructor(
    isLeft: boolean,
    isDead: boolean,
    x: number,
    y: number,
    dashTimer = 0,
    isDashing = false,
    canDash = true
  ) {
    super();
    this.isLeft = isLeft;
    this.isDead = isDead;
    this.x = x;
    this.y = y;
    this.dashTimer = dashTimer;
    this.isDashing = isDashing;
    this.canDash = canDash;
  }
}

class DiscState extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") vx: number;
  @type("number") vy: number;

  constructor(x: number, y: number, vx: number, vy: number) {
    super();
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}

/**
 * Game data on the server, shared with each clients
 */
class GameState extends Schema {
  @type("number") respawnTimer = 0;
  @type(DiscState) disc = new DiscState(0, 0, 0, 0);
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: "number" }) lastInputs = new MapSchema<number>();
}

export { GameState, PlayerState, DiscState };
