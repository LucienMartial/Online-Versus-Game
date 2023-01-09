import { Dispatcher } from "@colyseus/command";
import { Client, Room } from "colyseus";
import { DiscWarEngine } from "../app-shared/disc-war/disc-war.js";
import { GameState } from "../app-shared/state/index.js";
import { OnJoinCommand, OnLeaveCommand } from "./commands/index.js";
import { OnInputCommand } from "./commands/on-input.js";
import { OnSyncCommand } from "./commands/on-sync.js";
import { GAME_RATE } from "../app-shared/utils/index.js";

class GameRoom extends Room<GameState> {
  dispatcher = new Dispatcher(this);
  gameEngine: DiscWarEngine;
  accumulator: number;

  onCreate() {
    this.setState(new GameState());
    this.gameEngine = new DiscWarEngine();
    this.setSimulationInterval((dt: number) => this.update(dt), 1000 / 60);
    this.setPatchRate(30);
    this.accumulator = 0;

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
    // fixed update
    let now = this.clock.currentTime;
    this.accumulator += Math.max(dt / 1000, GAME_RATE);
    while (this.accumulator >= GAME_RATE) {
      this.step(GAME_RATE, now);
      this.accumulator -= GAME_RATE;
      now += GAME_RATE;
    }

    // send state
    this.dispatcher.dispatch(new OnSyncCommand(), {
      gameEngine: this.gameEngine,
    });
  }

  step(dt: number, now: number) {
    // TODO: command to apply input, verify size of buffer etc..
    for (const client of this.clients) {
      const input = client.userData.inputBuffer.pop();
      if (!input) continue;
      this.gameEngine.processInput(input.time, input.inputs, client.id);
    }
    this.gameEngine.step(dt, now);
  }
}

export { GameRoom };
