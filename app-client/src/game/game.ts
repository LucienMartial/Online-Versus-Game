import { Assets } from "@pixi/assets";
import { Sprite } from "pixi.js";
import { BoxShape, LineShape } from "../../../app-shared/physics";
import { DiscWarEngine } from "../../../app-shared/disc-war/disc-war";
import { BodyEntity } from "../../../app-shared/game";
import { Scene } from "./scene";
import { Graphics } from "./utils/graphics";
import { PlayerRender, RenderObject } from "./renderer";
import { Client, Room } from "colyseus.js";
import { GameState } from "../../../app-shared/state/game-state";
import {
  InputData,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../../../app-shared/utils";
import { Predictor } from "./sync/predictor";

/**
 * Game scene, all logic is in game engine
 */
class GameScene extends Scene {
  gameEngine: DiscWarEngine;
  predictor: Predictor;
  client: Client;
  room: Room<GameState>;
  id: string;

  constructor(client: Client, room: Room<GameState>) {
    super();
    this.gameEngine = new DiscWarEngine();
    this.client = client;
    this.room = room;
    this.id = this.room.sessionId;
    this.predictor = new Predictor(this.gameEngine, this.id);
  }

  async load(): Promise<void> {
    const assets = await Assets.loadBundle("basic");

    // map
    const walls = this.gameEngine.get<BodyEntity>("walls");
    for (const wall of walls) {
      const shape = wall.collisionShape as LineShape;
      const displayLine = Graphics.createLine(
        shape.p1.x,
        shape.p1.y,
        shape.p2.x,
        shape.p2.y,
        5
      );
      const wallRender = new RenderObject(displayLine);
      wallRender.setPosition(wall.position.x, wall.position.y);
      this.add(wallRender);
    }

    // init character
    const characterDisplay = new Sprite(assets.character);
    const characterRender = new RenderObject(characterDisplay);
    characterRender.setOffset(150, 150);
    characterRender.onUpdate = (dt: number, now: number) => {
      characterRender.rotate(-0.5 * dt);
      characterRender.setPosition(
        WORLD_WIDTH * 0.8,
        WORLD_HEIGHT / 2 + Math.cos(now * 0.001) * 300
      );
    };
    characterRender.update(0, 0);
    this.add(characterRender);

    const discGhost = new RenderObject(
      Graphics.createRectangle(100, 100, 0x0099ff)
    );
    const playerGhost = new RenderObject(
      Graphics.createRectangle(80, 160, 0x0099ff)
    );
    this.add(discGhost);
    this.add(playerGhost);

    // init disc
    for (const disc of this.gameEngine.get<BodyEntity>("disc")) {
      const shape = disc.collisionShape as BoxShape;
      const discDisplay = Graphics.createRectangle(shape.width, shape.height);
      const discRender = new RenderObject(discDisplay);
      discRender.onUpdate = (dt: number, now: number) => {
        discRender.setPosition(disc.position.x, disc.position.y);
        discRender.setOffset(disc.offset.x, disc.offset.y);
      };
      this.add(discRender);
    }

    const mainPlayer = this.gameEngine.addPlayer(this.id);
    const mainPlayerRender = new PlayerRender(mainPlayer, this.id);
    mainPlayerRender.displayObject.zIndex = 5;
    this.add(mainPlayerRender);

    // initial game
    this.room.onStateChange.once((state) => {
      for (const id of state.players.keys()) {
        if (this.id === id) return;
        console.log("new player has joined", id);
        // already exist?
        if (this.gameEngine.getById("players", id)) return;
        // creater renderer
        const player = this.gameEngine.getPlayer(id);
        if (!player) {
          const player = this.gameEngine.addPlayer(id);
          const playerRender = new PlayerRender(player, id, 0x0099ff);
          this.add(playerRender);
        }
      }
    });

    // player joined game
    this.room.state.players.onAdd = (_, id) => {
      if (this.id === id) return;
      console.log("new player has joined", id);
      // already exist?
      if (this.gameEngine.getById("players", id)) return;
      // creater renderer
      const player = this.gameEngine.getPlayer(id);
      if (!player) {
        const player = this.gameEngine.addPlayer(id);
        const playerRender = new PlayerRender(player, id, 0x0099ff);
        this.add(playerRender);
      }
    };

    // player leaved the game
    this.room.state.players.onRemove = (_, id: string) => {
      if (this.id === id) return;
      console.log("player with id", id, "leaved the game");
      // remove it
      this.gameEngine.removePlayer(id);
      this.removeById(id);
    };

    this.room.onStateChange((state: GameState) => {
      const player = state.players.get(this.id);
      // if (player) playerGhost.setPosition(player.x, player.y);
      // discGhost.setPosition(state.disc.x, state.disc.y);
      this.predictor.synchronize(state);
    });
  }

  destroy() {
    Assets.unload("basic");
    super.destroy();
  }

  update(dt: number, now: number) {
    // base update
    super.update(dt, now);

    // current inputs
    const inputs = this.inputManager.inputs;
    const inputData: InputData = {
      time: now,
      inputs: inputs,
    };
    this.room.send("input", inputData);
    this.predictor.processInput(inputData);
    this.predictor.predict(dt);
  }
}

export { GameScene };
