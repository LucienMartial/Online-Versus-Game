import { Command } from "@colyseus/command";
import { Client } from "colyseus";
import { DiscWarEngine } from "../../app-shared/disc-war/index.js";
import { Inputs } from "../../app-shared/utils/inputs-types.js";
import { GameRoom } from "../game-room.js";

interface Data {
  client: Client;
  gameEngine: DiscWarEngine;
  data: Record<Inputs, boolean>;
}

let left = 0;

class OnInputCommand extends Command<GameRoom, Data> {
  execute({ client, gameEngine, data } = this.payload) {
    client.userData.inputBuffer.push(data);
  }
}

export { OnInputCommand };
