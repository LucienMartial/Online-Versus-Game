import { Vector } from "sat";
import { DiscWarEngine } from "../../../../app-shared/disc-war";
import { BodyEntity } from "../../../../app-shared/game";
import { GameState } from "../../../../app-shared/state/game-state";
import { InputData, lerp } from "../../../../app-shared/utils";

const MAX_RESIMU_STEP = 80;

class Shadow {
  oPosition: Vector;
  oVelocity: Vector;
  position: Vector;
  velocity: Vector;
  bendPosition: Vector;
  bendVelocity: Vector;

  constructor(position: Vector, velocity: Vector) {
    this.oPosition = new Vector().copy(position);
    this.oVelocity = new Vector().copy(velocity);
    this.position = new Vector();
    this.velocity = new Vector();
    this.bendPosition = new Vector();
    this.bendVelocity = new Vector();
  }

  bend(position: Vector, velocity: Vector, factor = 0.1) {
    position.x = lerp(this.oPosition.x, position.x, factor);
    position.y = lerp(this.oPosition.y, position.y, factor);
    velocity.x = lerp(this.oVelocity.x, velocity.x, factor);
    velocity.y = lerp(this.oVelocity.y, velocity.y, factor);
  }
}

interface Interpolation {
  time: number;
  position: Vector;
}

// predict next game state, handle synchronization with server
// for the moment, only handle player
class Predictor {
  gameEngine: DiscWarEngine;
  playerId: string;
  inputs: InputData[];

  constructor(gameEngine: DiscWarEngine, playerId: string) {
    this.gameEngine = gameEngine;
    this.playerId = playerId;
    this.inputs = [];
  }

  processInput(inputData: InputData) {
    this.inputs.push(structuredClone(inputData));
    this.gameEngine.processInput(inputData.inputs, this.playerId);
  }

  predict(dt: number) {
    if (this.inputs.length > MAX_RESIMU_STEP) return;
    this.gameEngine.fixedUpdate(dt, false);
  }

  synchronize(state: GameState) {
    // synchronize players

    for (const [id, playerState] of state.players.entries()) {
      if (id === this.playerId) continue;
      const player = this.gameEngine.getPlayer(id);
      if (!player) continue;
      // interpolation new position
      player.lerpTo(playerState.x, playerState.y, 0.3);
    }

    // Extrapolation with bending at the end

    // get main player
    const player = this.gameEngine.getPlayer(this.playerId);
    const playerState = state.players.get(this.playerId);
    if (!player || !playerState) return;

    if (playerState.isDashing) return;

    // save shadows
    const disc = this.gameEngine.getOne<BodyEntity>("disc");
    const discShadow = new Shadow(disc.position, disc.velocity);
    const playerShadow = new Shadow(player.position, player.velocity);

    // synchronize
    disc.setPosition(state.disc.x, state.disc.y);
    disc.setVelocity(state.disc.vx, state.disc.vy);
    player.setPosition(playerState.x, playerState.y);
    player.dashStart = playerState.dashStart;
    player.isDashing = playerState.isDashing;
    player.canDash = playerState.canDash;

    // re simulate (extrapolation)
    const lastInputTime = state.lastInputs.get(this.playerId);
    if (!lastInputTime) return;
    this.reconciliate(lastInputTime, state);

    // bending phase
    discShadow.bend(disc.position, disc.velocity, 0.15);
    playerShadow.bend(player.position, player.velocity, 0.05);
  }

  // re apply input and re update from synchronization timestamp
  reconciliate(start: number, state: GameState) {
    const player = this.gameEngine.getPlayer(this.playerId);
    if (!player) return;

    let i = 0;
    // console.log("reconciliate");
    for (const data of this.inputs) {
      if (data.time === start) {
        this.inputs.splice(0, i);
        if (this.inputs.length > MAX_RESIMU_STEP) {
          this.inputs.splice(0, this.inputs.length - MAX_RESIMU_STEP);
          return;
        }

        /**
         * Interpolation
         */

        // re apply input and re simulate the game
        let last = data.time;
        for (const input of this.inputs) {
          const now = input.time;
          let dt = (now - last) * 0.001;
          last = input.time;

          player.processInput(input.inputs);
          this.gameEngine.step(dt, true);
        }

        break;
      }
      i++;
    }
  }
}

export { Predictor };
