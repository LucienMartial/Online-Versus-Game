import { Container, DisplayObject, Sprite } from "pixi.js";
import { Assets } from "@pixi/assets";
import { PhysicEngine, Entity, BoxShape } from "../../../app-shared/physics";
import {
  GameObject,
  RenderObject,
  CollisionObject,
  Context,
} from "./game-object";
import { Graphics } from "./graphics";
import { InputManager } from "./input";
import { MapManager } from "./map-manager";
import { Player } from "./player";

/**
 * Main scene containing the game
 */
class Scene {
  elapsed = 0;
  ctx: Context;
  gameObjects: GameObject[];

  constructor(width: number, height: number) {
    this.elapsed = 0;
    this.gameObjects = [];
    const stage = new Container();
    const inputManager = new InputManager();
    const physicEngine = new PhysicEngine();
    this.ctx = new Context(stage, physicEngine, inputManager, width, height);
  }

  // clean up the scene
  destroy() {
    Assets.unloadBundle("basic");
    this.ctx.stage.destroy();
  }

  // load asset and create game object
  async load(): Promise<void> {
    const assets = await Assets.loadBundle("basic");

    // map
    const mapManager = new MapManager(this.ctx);
    this.gameObjects.push(mapManager);

    // init character
    const characterDisplay = new Sprite(assets.character);
    const character = new RenderObject(this.ctx, characterDisplay);
    character.setPosition(this.ctx.width * 0.8, this.ctx.height / 2);
    character.setOffset(150, 150);
    character.onUpdate = (dt) => {
      character.rotate(-0.5 * dt);
      character.move(0, Math.cos(this.elapsed) * 5);
    };
    // this.gameObjects.push(character);

    // init player with dash
    const player = new Player(this.ctx);
    player.setPosition(this.ctx.width / 3, this.ctx.height / 2);
    player.accelerate(-300, 300);
    this.gameObjects.push(player);

    // init basic box
    const size = { x: 100, y: 200 };
    const boxDisplay = Graphics.createRectangle(size.x, size.y, 0x0099ff);
    const box = new CollisionObject(
      this.ctx,
      boxDisplay,
      new BoxShape(size.x, size.y),
      false
    );
    box.setPosition(this.ctx.width / 2, this.ctx.height / 2);
    box.setRotation(Math.PI / 2);
    box.setOffset(50, 100);
    box.onUpdate = (dt) => {
      box.rotate(2 * dt);
    };
    this.gameObjects.push(box);
  }

  update(now: number, dt: number): void {
    // update logic
    this.elapsed += dt;
    this.ctx.physicEngine.fixedUpdate(dt);

    // update and render
    for (const object of Object.values(this.gameObjects)) {
      object.update(dt);
      object.render();
    }
  }
}

export { Scene };
