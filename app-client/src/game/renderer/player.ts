import { Player } from "../../../../app-shared/disc-war";
import { BoxShape } from "../../../../app-shared/physics";
import { Graphics } from "../utils/graphics";
import { RenderObject } from "./render-object";

class PlayerRender extends RenderObject {
  player: Player;

  constructor(player: Player, id: string, color = 0x990000) {
    const shape = player.collisionShape as BoxShape;
    const playerDisplay = Graphics.createRectangle(
      shape.width,
      shape.height,
      color
    );
    super(playerDisplay, id);
    this.player = player;
  }

  update(dt: number) {
    this.setPosition(this.player.position.x, this.player.position.y);
  }
}

export { PlayerRender };
