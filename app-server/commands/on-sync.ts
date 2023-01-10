import { Command } from "@colyseus/command";
import { Client } from "colyseus";
import { DiscWarEngine, Player } from "../../app-shared/disc-war/index.js";
import { BodyEntity } from "../../app-shared/game/body-entity.js";
import { DiscState, PlayerState } from "../../app-shared/state/game-state.js";
import { GameRoom } from "../game-room.js";

interface Data {
  gameEngine: DiscWarEngine;
}

class OnSyncCommand extends Command<GameRoom, Data> {
  execute({ gameEngine } = this.payload) {
    for (const player of gameEngine.get<Player>("players")) {
      this.state.players.set(
        player.id,
        new PlayerState(
          player.position.x,
          player.position.y,
          player.canDash,
          player.isDashing,
          player.dashStart
        )
      );
    }
  }
}

export { OnSyncCommand };
