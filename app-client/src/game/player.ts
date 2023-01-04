import {CollisionObject} from "./game-object";
import {Graphics} from "./graphics";
import {BoxShape} from "../../../app-shared/physics";
import {Context} from "./game-object";

const speed: number = 80;
const dashSpeed: number = 500;

class Player extends CollisionObject {
    constructor(context: Context) {
        super(context, Graphics.createRectangle(100, 200), new BoxShape(100, 200), false);
    }

    processInput(inputs: { [key: string]: boolean }): void {
        const dash: number = inputs.space ? dashSpeed : 0;
        if (inputs.left) this.accelerate(-speed - dash, 0);
        else if (inputs.right) this.accelerate(speed + dash, 0);
        if (inputs.up) this.accelerate(0, -speed - dash);
        else if (inputs.down) this.accelerate(0, speed + dash);
    }

    update(dt: number): void {
        this.processInput(this.ctx.inputManager.inputs);
        super.update(dt);
    }
}

export {Player};