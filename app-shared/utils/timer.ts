interface Event {
  duration: number;
  callback: Function;
}

/**
 * Rollback oriented Timer that can be synchronized with server
 */
class Timer {
  timer: number;
  events: Event[];

  constructor() {
    this.timer = 0;
    this.events = [];
  }

  add(duration: number, callback: Function) {
    this.events.push({ duration: duration, callback: callback });
  }

  clear() {
    this.events = [];
  }

  reset() {
    this.timer = 0;
  }

  sync(timer: number) {
    this.timer = timer;
  }

  update() {
    this.timer += 1;
    for (const event of this.events) {
      if (this.timer >= event.duration) event.callback();
    }
  }
}

export { Timer };
