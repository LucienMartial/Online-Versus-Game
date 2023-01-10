import { Dispatcher } from "@colyseus/command";
import { Client, Room } from "colyseus";
import { DiscWarEngine } from "../app-shared/disc-war/disc-war.js";
import { DiscState, GameState } from "../app-shared/state/index.js";
import { OnJoinCommand, OnLeaveCommand } from "./commands/index.js";
import { InputData } from "../app-shared/types/index.js";
import { OnInputCommand } from "./commands/on-input.js";
import { OnSyncCommand } from "./commands/on-sync.js";
import { BodyEntity } from "../app-shared/game/body-entity.js";

interface UserData {
  inputBuffer: InputData[];
}

class GameRoom extends Room<GameState> {
  dispatcher = new Dispatcher(this);
  gameEngine: DiscWarEngine;

  onCreate() {
    this.setState(new GameState());
    this.gameEngine = new DiscWarEngine();
    this.setSimulationInterval((dt: number) => this.update(dt), 1000 / 60);
    this.setPatchRate(30);

    // register event
    this.onMessage("*", (client, type, message) => {
      const baseData = {
        client: client,
        data: message,
      };

      switch (type) {
        case "input":
          this.dispatcher.dispatch(new OnInputCommand(), baseData);
          break;
        default:
          console.log("invalid message");
          break;
      }
    });
  }

  // verify token, etc..
  async onAuth(client: Client) {
    console.log("client authentication");
    return true;
  }

  onJoin(client: Client) {
    this.dispatcher.dispatch(new OnJoinCommand(), {
      client: client,
      gameEngine: this.gameEngine,
    });
  }

  onLeave(client: Client) {
    this.dispatcher.dispatch(new OnLeaveCommand(), {
      client: client,
      gameEngine: this.gameEngine,
    });
  }

  onDispose(): void | Promise<any> {
    this.dispatcher.stop();
  }

  // simulation update, 60 hertz
  update(dt: number) {
    for (const client of this.clients) {
      const data = client.userData as UserData;
      const inputData = data.inputBuffer.shift();
      if (!inputData) continue;
      this.gameEngine.processInput(inputData.inputs, client.id);
      this.state.lastInputs.set(client.id, inputData.time);
    }

    this.gameEngine.fixedUpdate(dt * 0.001, false);

    for (const disc of this.gameEngine.get<BodyEntity>("disc")) {
      this.state.disc = new DiscState(
        disc.position.x,
        disc.position.y,
        disc.velocity.x,
        disc.velocity.y
      );
    }

    // send state
    this.dispatcher.dispatch(new OnSyncCommand(), {
      gameEngine: this.gameEngine,
    });
  }
}

export { GameRoom };
