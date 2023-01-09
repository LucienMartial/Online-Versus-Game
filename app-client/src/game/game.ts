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
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../../app-shared/utils";

/**
 * Game scene, all logic is in game engine
 */
class GameScene extends Scene {
  gameEngine: DiscWarEngine;
  client: Client;
  room: Room<GameState>;
  id: string;

  constructor(client: Client, room: Room<GameState>) {
    super();
    this.gameEngine = new DiscWarEngine();
    this.client = client;
    this.room = room;
    this.id = this.room.sessionId;
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

    // init box
    for (const box of this.gameEngine.get<BodyEntity>("boxes")) {
      const shape = box.collisionShape as BoxShape;
      const boxDisplay = Graphics.createRectangle(shape.width, shape.height);
      const boxRender = new RenderObject(boxDisplay);
      boxRender.onUpdate = (dt: number, now: number) => {
        boxRender.setPosition(box.position.x, box.position.y);
        boxRender.setOffset(box.offset.x, box.offset.y);
        boxRender.setRotation(box.rotation);
      };
      this.add(boxRender);
    }

    const mainPlayer = this.gameEngine.addPlayer(this.id + "a");
    const mainPlayerRender = new PlayerRender(mainPlayer, this.id + "a");
    mainPlayerRender.displayObject.zIndex = 5;
    this.add(mainPlayerRender);

    // player joined the game
    // fetch current state
    this.room.onStateChange.once((state) => {
      for (const id of state.players.keys()) {
        // if (id === this.id) continue;
        const player = this.gameEngine.addPlayer(id);
        const playerRender = new PlayerRender(player, id, 0x0099ff);
        this.add(playerRender);
      }
    });

    this.room.state.players.onAdd = (_, id) => {
      // if (id === this.id) return;
      console.log("new player has joined", id);
      // already exist?
      if (this.gameEngine.getById("players", id)) return;
      // creater renderer
      const player = this.gameEngine.addPlayer(id);
      const playerRender = new PlayerRender(player, id, 0x0099ff);
      this.add(playerRender);
    };

    // player leaved the game
    this.room.state.players.onRemove = (_, id: string) => {
      // if (id === this.id) return;
      console.log("player with id", id, "leaved the game");
      // remove it
      this.gameEngine.removePlayer(id);
      this.removeById(id);
    };

    // player got updated
    this.room.state.players.onChange = (other, id) => {
      const player = this.gameEngine.getPlayer(id);
      if (!player) return;
      // const lerpPower = this.id === id ? 0.9 : 0.9;
      // mainPlayer.lerpTo(other.x, other.y, lerpPower);
      player.setPosition(other.x, other.y);
      if (this.id === id) {
        // console.log(mainPlayer.position.x, mainPlayer.position.y);
        // console.log(other.x, other.y);
        // console.log("");
      }
    };
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
    this.room.send("input", { time: now, inputs: inputs });
    this.gameEngine.processInput(now, inputs, this.id + "a");
    this.gameEngine.fixedUpdate(dt, now);
  }
}

export { GameScene };
