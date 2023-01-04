import { Container, DisplayObject, Sprite } from "pixi.js";
import { Assets } from "@pixi/assets";
import { PhysicEngine, Entity, BoxShape } from "../../../app-shared/physics";
import { gameObject } from "./game-object";
import { Graphics } from "./graphics";
import { InputManager } from "./input";
import { Vector } from "sat";

class Scene {
  elapsed = 0;
  stage: Container<DisplayObject>;
  width: number;
  height: number;
  gameObjects: { [key: string]: gameObject };
  physicEngine: PhysicEngine;
  inputManager: InputManager;

  constructor(width: number, height: number) {
    this.elapsed = 0;
    this.width = width;
    this.height = height;
    this.stage = new Container();
    this.gameObjects = {};
    this.inputManager = new InputManager();
    this.physicEngine = new PhysicEngine();
  }

  // clean up the scene
  destroy() {
    Assets.unloadBundle("basic");
    this.stage.destroy();
  }

  // load asset and create game object
  async load(): Promise<void> {
    const assets = await Assets.loadBundle("basic");

    // player
    const player = new gameObject(
      Graphics.createRectangle(100, 100),
      new BoxShape(100, 100),
      false
    );
    player.velocity.x = 2500;
    player.velocity.y = 1500;
    this.physicEngine.world.entities.add(player);
    this.stage.addChild(player.displayObject);
    this.gameObjects.player = player;

    // init character
    const characterDisplay = new Sprite(assets.character);
    const character = new gameObject(characterDisplay, new BoxShape(300, 400));
    character.setOffset(150, 150);
    character.setPosition(this.width * 0.8, this.height / 2);
    this.physicEngine.world.entities.add(character);
    this.stage.addChild(character.displayObject);
    this.gameObjects.character = character;

    // init basic box
    const size = { x: 100, y: 200 };
    const boxDisplay = Graphics.createRectangle(size.x, size.y, 0x0099ff);
    const box = new gameObject(boxDisplay, new BoxShape(size.x, size.y), false);
    box.setPosition(this.width / 2, this.height / 2);
    box.setOffset(50, 100);
    box.setRotation(Math.PI / 2);
    this.physicEngine.world.entities.add(box);
    this.stage.addChild(box.displayObject);
    this.gameObjects.box = box;
  }

  update(now: number, dt: number): void {
    // update logic
    this.elapsed += dt;
    this.physicEngine.fixedUpdate(dt);

    // character
    const character = this.gameObjects.character;
    character.setRotation(character.rotation - 0.5 * dt);
    character.setPosition(
      character.position.x,
      character.position.y + Math.cos(this.elapsed) * 5
    );

    // box
    const box = this.gameObjects.box;
    box.setRotation(box.rotation + 2 * dt);

    // move player
    const player = this.gameObjects.player;
    const inputs = this.inputManager.inputs;
    const speed = 80;

    if (inputs.left) player.velocity.x -= speed;
    else if (inputs.right) player.velocity.x += speed;
    if (inputs.up) player.velocity.y -= speed;
    else if (inputs.down) player.velocity.y += speed;

    // render
    for (const object of Object.values(this.gameObjects)) {
      object.render();
    }
  }
}

export { Scene };
