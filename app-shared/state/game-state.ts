import { Schema, MapSchema, type } from "@colyseus/schema";

class PlayerState extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") dashStart: number;
  @type("boolean") canDash: boolean;
  @type("boolean") isDashing: boolean;

  constructor(
    x: number,
    y: number,
    canDash = true,
    isDashing = false,
    dashStart = 0
  ) {
    super();
    this.x = x;
    this.y = y;
    this.canDash = canDash;
    this.isDashing = isDashing;
    this.dashStart = dashStart;
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

class GameState extends Schema {
  @type(DiscState) disc: DiscState;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: "number" }) lastInputs = new MapSchema<number>();
}

export { GameState, PlayerState, DiscState };
