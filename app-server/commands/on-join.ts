import { Command } from "@colyseus/command";
import { GameRoom } from "../game-room.js";
import { PlayerState } from "../../app-shared/state/index.js";
import { Client } from "colyseus";
import { DiscWarEngine } from "../../app-shared/disc-war/index.js";
import { CBuffer } from "../../app-shared/utils/cbuffer.js";
import { InputData } from "../../app-shared/types/inputs.js";

interface Data {
  maxInputs: number;
  client: Client;
  gameEngine: DiscWarEngine;
}

class OnJoinCommand extends Command<GameRoom, Data> {
  execute({ maxInputs, client, gameEngine } = this.payload) {
    console.log("client joined", client.id);

    client.userData = {
      inputBuffer: new CBuffer<InputData>(maxInputs),
    };

    const player = gameEngine.addPlayer(client.id, this.room.isLeft);
    this.room.isLeft = !this.room.isLeft;

    this.state.players.set(
      client.id,
      new PlayerState(
        player.isLeft,
        player.isDead,
        player.position.x,
        player.position.y
      )
    );
  }
}

export { OnJoinCommand };
