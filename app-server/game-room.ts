import { Dispatcher } from "@colyseus/command";
import { Client, ClientState, Room } from "colyseus";
import { DiscWarEngine } from "../app-shared/disc-war/disc-war.js";
import { GameState } from "../app-shared/state/index.js";
import { OnJoinCommand, OnLeaveCommand } from "./commands/index.js";
import { OnInputCommand } from "./commands/on-input.js";
import { OnSyncCommand } from "./commands/on-sync.js";

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
        gameEngine: this.gameEngine,
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
    // TODO: command to apply input, verify size of buffer etc..
    for (const client of this.clients) {
      const lastInput = client.userData.inputBuffer.pop();
      if (!lastInput) continue;
      this.gameEngine.processInput(lastInput, client.id);
    }

    this.gameEngine.update(dt * 0.001, this.clock.elapsedTime);
    this.dispatcher.dispatch(new OnSyncCommand(), {
      gameEngine: this.gameEngine,
    });
  }
}

export { GameRoom };
