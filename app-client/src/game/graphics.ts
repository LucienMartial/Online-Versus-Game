import * as PIXI from "pixi.js";

/**
 * Helper containing basic shape initialization methods
 */
class Graphics {
  static createRectangle(
    width = 100,
    height = 100,
    color = 0x990000
  ): PIXI.Graphics {
    const obj = new PIXI.Graphics();
    obj.beginFill(color);
    obj.drawRect(0, 0, width, height);
    return obj;
  }
}

export { Graphics };
