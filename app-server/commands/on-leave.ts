import { Command } from "@colyseus/command";
import { Client } from "colyseus";
import { DiscWarEngine } from "../../app-shared/disc-war/index.js";
import { GameRoom } from "../game-room.js";

class OnLeaveCommand extends Command<
  GameRoom,
  { client: Client; gameEngine: DiscWarEngine }
> {
  execute({ client, gameEngine } = this.payload) {
    console.log("player leaved", client.id);
    gameEngine.removePlayer(client.id);
    this.state.players.delete(client.id);
  }
}

export { OnLeaveCommand };
