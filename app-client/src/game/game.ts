import { Assets } from "@pixi/assets";
import { Sprite } from "pixi.js";
import { DiscWarEngine } from "../../../app-shared/disc-war/disc-war";
import { BodyEntity } from "../../../app-shared/game";
import { Scene } from "./scene";
import { Graphics } from "./utils/graphics";
import { DiscRender, PlayerRender, RenderObject } from "./renderer";
import { Client, Room } from "colyseus.js";
import { GameState, PlayerState } from "../../../app-shared/state/game-state";
import {
  InputData,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../../../app-shared/utils";
import { Predictor } from "./sync/predictor";
import { MapRender } from "./renderer/map-render";

const PLAYER_GHOST = false;
const DISC_GHOST = false;

/**
 * Game scene for the disc war game.
 * Render and manage inputs, all logic is in
 * the disc war game engine class.
 */
class GameScene extends Scene {
  gameEngine: DiscWarEngine;
  predictor: Predictor;
  client: Client;
  room: Room<GameState>;
  id: string;

  constructor(client: Client, room: Room<GameState>) {
    super();
    this.client = client;
    this.room = room;
    this.id = this.room.sessionId;
    this.gameEngine = new DiscWarEngine(false, this.id);
    this.predictor = new Predictor(this.gameEngine, this.id);
  }

  /**
   * Load assets and init objects for the disc game.
   * Do not forget to remove assets loaded in destroy
   */
  async load(): Promise<void> {
    const assets = await Assets.loadBundle("basic");

    // map
    const walls = this.gameEngine.get<BodyEntity>("walls");
    const splitLine = this.gameEngine.getOne<BodyEntity>("splitLine");
    const mapRender = new MapRender(walls, splitLine);
    this.add(mapRender);

    // init character
    const characterRender = new RenderObject();
    characterRender.addChild(new Sprite(assets.character));
    characterRender.setOffset(150, 150);
    characterRender.onUpdate = (dt: number, now: number) => {
      characterRender.rotate(-2.5 * dt);
      characterRender.setPosition(
        WORLD_WIDTH * 0.8,
        WORLD_HEIGHT / 2 + Math.cos(now * 0.001) * 300
      );
    };
    characterRender.update(0, 0);
    this.add(characterRender);

    // disc render
    const disc = this.gameEngine.getOne<BodyEntity>("disc");
    const discRender = new DiscRender(disc);
    this.add(discRender);

    // main player render
    const mainPlayer = this.gameEngine.addPlayer(this.id, true);
    const mainPlayerRender = new PlayerRender(mainPlayer, this.id);
    mainPlayerRender.container.zIndex = 5;
    this.add(mainPlayerRender);

    // init game, add, remove players
    this.room.onStateChange.once((state) => {
      this.initGame(state);
    });
    this.room.state.players.onAdd = (state, id) => {
      this.addPlayer(id, state);
    };
    this.room.state.players.onRemove = (_, id: string) => {
      this.removePlayer(id);
    };

    // ghosts
    let discGhost: RenderObject;
    let playerGhost: RenderObject;
    if (DISC_GHOST) {
      discGhost = new RenderObject();
      discGhost.addChild(Graphics.createCircle(50, 0x0099ff));
      this.add(discGhost);
    }
    if (PLAYER_GHOST) {
      playerGhost = new RenderObject();
      playerGhost.addChild(Graphics.createRectangle(80, 160, 0x0099ff));
      playerGhost.setOffset(40, 80);
      this.add(playerGhost);
    }

    // synchronization
    this.room.onStateChange((state: GameState) => {
      if (PLAYER_GHOST) {
        const player = state.players.get(this.id);
        if (player) playerGhost.setPosition(player.x, player.y);
      }
      if (DISC_GHOST) {
        discGhost.setPosition(state.disc.x, state.disc.y);
      }
      this.predictor.synchronize(state, Date.now());
    });
  }

  /**
   * Custom destroy, do not forget to unload assets
   */
  destroy() {
    Assets.unload("basic");
    super.destroy();
  }

  /**
   * Synchronize with the server state only one time at the beginning
   */
  initGame(state: GameState) {
    for (const [id, playerState] of state.players.entries()) {
      this.addPlayer(id, playerState);
    }
  }

  /**
   * Add a player it to the game engine and renderer when he joined
   */
  addPlayer(id: string, state: PlayerState) {
    if (this.id === id) return;
    if (this.gameEngine.getById("players", id)) return;
    console.log("new player has joined", id);
    const player = this.gameEngine.getPlayer(id);
    if (!player) {
      const player = this.gameEngine.addPlayer(id, state.isLeft);
      const playerRender = new PlayerRender(player, id, 0x0099ff);
      this.add(playerRender);
    }
  }

  /**
   * Remove player when he leave
   */
  removePlayer(id: string) {
    if (this.id === id) return;
    console.log("player with id", id, "leaved the game");
    this.gameEngine.removePlayer(id);
    this.removeById(id);
  }

  /**
   * Get player input, send it to server and directly predict next
   * game simulation step
   */
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
