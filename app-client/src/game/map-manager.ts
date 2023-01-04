import { Context, GameObject, RenderObject } from "./game-object";
import { Map } from "../../../app-shared/map";
import { Graphics } from "./graphics";
import { LineShape } from "../../../app-shared/physics";

class MapManager extends GameObject {
  walls: RenderObject[];
  map: Map;

  constructor(ctx: Context) {
    super(ctx);
    this.map = new Map(this.ctx.width, this.ctx.height);
    this.walls = [];

    for (const wall of this.map.walls) {
      // physics
      this.ctx.physicEngine.world.entities.add(wall);
      // rendering
      const shape = wall.collisionShape as LineShape;
      const displayWall = Graphics.createLine(
        shape.p1.x,
        shape.p1.y,
        shape.p2.x,
        shape.p2.y
      );
      const wallEntity = new RenderObject(this.ctx, displayWall);
      wallEntity.setPosition(wall.position.x, wall.position.y);
      wallEntity.render();
    }
  }

  update(dt: number) {}

  render() {}
}

export { MapManager };
