import { Command } from "@colyseus/command";
import { GameRoom } from "../game-room.js";
import { PlayerState } from "../../app-shared/state/index.js";
import { Client } from "colyseus";
import { DiscWarEngine } from "../../app-shared/disc-war/index.js";

class OnJoinCommand extends Command<
  GameRoom,
  { client: Client; gameEngine: DiscWarEngine }
> {
  execute({ client, gameEngine } = this.payload) {
    console.log("client joined", client.id);

    client.userData = {
      inputBuffer: [],
    };

    const player = gameEngine.addPlayer(client.id);
    this.state.players.set(
      client.id,
      new PlayerState(player.position.x, player.position.y)
    );
  }
}

export { OnJoinCommand };
