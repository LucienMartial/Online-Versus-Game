import { Schema, MapSchema, type } from "@colyseus/schema";

class PlayerState extends Schema {
  @type("number") x: number;
  @type("number") y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
}

class GameState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}

export { GameState, PlayerState };
