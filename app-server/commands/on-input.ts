import { Command } from "@colyseus/command";
import { Client } from "colyseus";
import { InputData } from "../../app-shared/types/inputs.js";
import { GameRoom } from "../game-room.js";

interface Data {
  client: Client;
  data: InputData;
}

class OnInputCommand extends Command<GameRoom, Data> {
  execute({ client, data } = this.payload) {
    client.userData.inputBuffer.push(data);
  }
}

export { OnInputCommand };
